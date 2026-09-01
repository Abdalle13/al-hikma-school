import crypto from "crypto";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";

// shape the user object we send back, never the password or reset fields
function publicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    photo: user.photo,
    status: user.status,
    createdAt: user.createdAt,
  };
}

// POST /api/auth/register
// public parent self registration. the account stays Inactive until an admin
// links a child and activates it in phase b2. staff accounts are made by an admin.
export async function registerUser(req, res, next) {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email and password are required");
    }
    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      res.status(409);
      throw new Error("An account with this email already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: "Parent",
      status: "Inactive",
    });

    res.status(201).json({
      message: "Account created. An admin will link your child and activate the account.",
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
export async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    if (user.status !== "Active") {
      res.status(403);
      throw new Error("Your account is not active yet. Please wait for admin approval.");
    }

    res.json({
      token: generateToken(user._id),
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
export async function getMe(req, res, next) {
  try {
    res.json({ user: publicUser(req.user) });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/forgot-password
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400);
      throw new Error("Email is required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // always answer the same way so the endpoint cannot be used to probe emails
    const genericMessage = "If that email is registered, a reset link has been sent.";
    if (!user) {
      return res.json({ message: genericMessage });
    }

    const rawToken = user.createResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${rawToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `You asked to reset your password. Open this link within 30 minutes:\n\n${resetUrl}\n\nIf you did not ask for this, ignore this email.`,
        html: `<p>You asked to reset your password. Open this link within 30 minutes:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not ask for this, ignore this email.</p>`,
      });
    } catch (mailErr) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500);
      throw new Error("Could not send the reset email, please try again later");
    }

    res.json({ message: genericMessage });
  } catch (err) {
    next(err);
  }
}

// PUT /api/auth/reset-password/:token
export async function resetPassword(req, res, next) {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      res.status(400);
      throw new Error("A new password of at least 6 characters is required");
    }

    const hashed = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      res.status(400);
      throw new Error("The reset link is invalid or has expired");
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      message: "Password updated",
      token: user.status === "Active" ? generateToken(user._id) : undefined,
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
}
