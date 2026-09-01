import express from "express";
import {
  getPublicSettings,
  getSettings,
  updateSettings,
} from "../controllers/settingsController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getPublicSettings); // public
router.get("/admin", protect, admin, getSettings);
router.put("/", protect, admin, updateSettings);

export default router;
