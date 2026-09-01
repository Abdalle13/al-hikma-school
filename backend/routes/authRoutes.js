import express from "express";
import {
  login,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/login", authLimiter, login);
router.post("/forgot-password", authLimiter, forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/me", protect, getMe);
router.post("/change-password", protect, changePassword);

export default router;
