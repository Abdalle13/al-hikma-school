import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

// there is no public registration. the admin creates every account and sets the
// password (see userController.js). there is also no self service password
// reset: an admin resets a password from the user's edit form. these handlers
// cover login, the current session, and the first login password change only.

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
