import express from "express";
import {
  listNotifications,
  markRead,
  markAllRead,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, listNotifications);
router.patch("/read-all", protect, markAllRead);
router.patch("/:id/read", protect, markRead);

export default router;
