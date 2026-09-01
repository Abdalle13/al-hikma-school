import express from "express";
import {
  createSubject,
  listSubjects,
  getSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/subjectController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// reading is open to any signed in user, writing is admin only
router.get("/", protect, listSubjects);
router.get("/:id", protect, getSubject);
router.post("/", protect, admin, createSubject);
router.put("/:id", protect, admin, updateSubject);
router.delete("/:id", protect, admin, deleteSubject);

export default router;
