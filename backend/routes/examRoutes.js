import express from "express";
import {
  createExam,
  listExams,
  getExam,
  updateExam,
  deleteExam,
  enterMarks,
  listMarks,
} from "../controllers/examController.js";
import { protect, admin, teacher } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, teacher, listExams);
router.get("/:id", protect, teacher, getExam);
router.get("/:id/marks", protect, teacher, listMarks);

router.post("/", protect, teacher, createExam);
router.put("/:id", protect, teacher, updateExam);
router.put("/:id/marks", protect, teacher, enterMarks);
router.delete("/:id", protect, admin, deleteExam);

export default router;
