import express from "express";
import {
  saveTimetable,
  getClassTimetable,
  getTeacherTimetable,
  myTimetable,
  deleteTimetable,
} from "../controllers/timetableController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, myTimetable);
router.get("/class/:classId", protect, getClassTimetable);
router.get("/teacher/:teacherId", protect, getTeacherTimetable);

router.post("/", protect, admin, saveTimetable);
router.put("/", protect, admin, saveTimetable);
router.delete("/:id", protect, admin, deleteTimetable);

export default router;
