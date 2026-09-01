// auth handlers. the real logic (register, login, forgot and reset password,
// who am i) is built in backend phase b1. these are placeholders so the route
// file and folder structure are in place.

export async function registerUser(req, res, next) {
  try {
    res.status(501).json({ message: "register is not implemented yet (phase b1)" });
  } catch (err) {
    next(err);
  }
}

export async function loginUser(req, res, next) {
  try {
    res.status(501).json({ message: "login is not implemented yet (phase b1)" });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    res.status(501).json({ message: "who am i is not implemented yet (phase b1)" });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    res.status(501).json({ message: "forgot password is not implemented yet (phase b1)" });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    res.status(501).json({ message: "reset password is not implemented yet (phase b1)" });
  } catch (err) {
    next(err);
  }
}
