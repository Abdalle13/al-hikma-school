import express from "express";
import {
  markAttendance,
  listAttendance,
  getAttendance,
  studentSummary,
  updateAttendance,
  deleteAttendance,
} from "../controllers/attendanceController.js";
import { protect, admin, teacher } from "../middleware/authMiddleware.js";

const router = express.Router();

// any signed in user can read (the controller scopes what a parent or student sees)
router.get("/", protect, listAttendance);
router.get("/summary/:studentId", protect, studentSummary);
router.get("/:id", protect, teacher, getAttendance);

// teachers and admins mark and edit, admin deletes
router.post("/", protect, teacher, markAttendance);
router.put("/:id", protect, teacher, updateAttendance);
router.delete("/:id", protect, admin, deleteAttendance);

export default router;
