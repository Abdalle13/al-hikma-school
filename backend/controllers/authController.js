import crypto from "crypto";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";

// there is no public registration. the admin creates every account
// (see userController.js). these handlers cover login and password flows only.

// POST /api/auth/login
// body: { loginId, password }  loginId is an email (staff, parents) or an
// admission number (students). the form sends one field, we detect which.
export async function login(req, res, next) {
  try {
    const loginId = (req.body.loginId || req.body.email || req.body.admissionNo || "").trim();
    const { password } = req.body;

    if (!loginId || !password) {
      res.status(400);
      throw new Error("Login and password are required");
    }

    const query = loginId.includes("@")
      ? { email: loginId.toLowerCase() }
      : { admissionNo: loginId.toUpperCase() };

    const user = await User.findOne(query).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid login or password");
    }

    if (user.status !== "Active") {
      res.status(403);
      throw new Error("Your account is inactive, contact the school");
    }

    res.json({
      token: generateToken(user._id),
      user: user.toSafeJSON(),
      mustChangePassword: user.mustChangePassword,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
export async function getMe(req, res, next) {
  try {
    res.json({ user: req.user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/change-password  (protected)
// body: { currentPassword, newPassword }
// used for the first-login change and any later change
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error("Current and new password are required");
    }
    if (newPassword.length < 6) {
      res.status(400);
      throw new Error("The new password must be at least 6 characters");
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.matchPassword(currentPassword))) {
      res.status(401);
      throw new Error("Your current password is wrong");
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.json({
      message: "Password changed",
      token: generateToken(user._id),
      user: user.toSafeJSON(),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/forgot-password
// body: { email }   only works for accounts that have an email
export async function forgotPassword(req, res, next) {
  try {
    const email = (req.body.email || "").toLowerCase().trim();
    if (!email) {
      res.status(400);
      throw new Error("Email is required");
    }

    const user = await User.findOne({ email });

    // always answer the same way so the endpoint cannot probe for emails
    const genericMessage = "If that email is registered, a reset link has been sent.";
    if (!user) return res.json({ message: genericMessage });

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
// body: { password }
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
    user.mustChangePassword = false;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      message: "Password updated",
      token: generateToken(user._id),
      user: user.toSafeJSON(),
    });
  } catch (err) {
    next(err);
  }
}
