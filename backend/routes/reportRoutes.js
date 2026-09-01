import express from "express";
import {
  enrolmentReport,
  feesReport,
  attendanceReport,
  examsReport,
  overviewReport,
} from "../controllers/reportController.js";
import { protect, admin, teacher } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/overview", protect, teacher, overviewReport);
router.get("/enrolment", protect, teacher, enrolmentReport);
router.get("/attendance", protect, teacher, attendanceReport);
router.get("/exams", protect, teacher, examsReport);
router.get("/fees", protect, admin, feesReport);

export default router;
