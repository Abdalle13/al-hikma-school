import express from "express";
import {
  generateReportCards,
  listReportCards,
  getReportCard,
  getStudentReportCard,
  updateReportCard,
  setPublished,
  bulkPublish,
  reportCardPdf,
} from "../controllers/reportCardController.js";
import { protect, admin, teacher } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", protect, admin, generateReportCards);
router.patch("/publish", protect, admin, bulkPublish);

router.get("/", protect, teacher, listReportCards);
router.get("/student/:studentId", protect, getStudentReportCard);
router.get("/:id", protect, getReportCard);
router.get("/:id/pdf", protect, reportCardPdf);

router.put("/:id", protect, teacher, updateReportCard);
router.patch("/:id/publish", protect, admin, setPublished(true));
router.patch("/:id/unpublish", protect, admin, setPublished(false));

export default router;
