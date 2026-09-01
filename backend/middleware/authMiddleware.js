import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// verify the bearer token and attach the user to the request
export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      res.status(401);
      throw new Error("Not authorised, no token");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401);
      throw new Error("Not authorised, user not found");
    }

    if (user.status !== "Active") {
      res.status(403);
      throw new Error("Your account is inactive, contact the school");
    }

    req.user = user;
    next();
  } catch (err) {
    if (res.statusCode === 200) res.status(401);
    next(err);
  }
}

// allow only the listed roles, use after protect
export function allow(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error("You do not have access to this resource"));
    }
    next();
  };
}

export const admin = allow("Admin");
export const teacher = allow("Admin", "Teacher");
export const parent = allow("Admin", "Parent");
