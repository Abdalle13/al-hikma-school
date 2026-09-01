import jwt from "jsonwebtoken";

// sign a json web token for a user id
export default function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}
