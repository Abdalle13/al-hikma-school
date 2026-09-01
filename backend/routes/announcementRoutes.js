import express from "express";
import {
  createAnnouncement,
  listAnnouncements,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  listPublic,
  getPublic,
} from "../controllers/announcementController.js";
import { protect, teacher } from "../middleware/authMiddleware.js";

const router = express.Router();

// public website endpoints, no auth
router.get("/public", listPublic);
router.get("/public/:id", getPublic);

// signed in
router.get("/", protect, listAnnouncements);
router.get("/:id", protect, getAnnouncement);
router.post("/", protect, teacher, createAnnouncement);
router.put("/:id", protect, teacher, updateAnnouncement);
router.delete("/:id", protect, teacher, deleteAnnouncement);

export default router;
