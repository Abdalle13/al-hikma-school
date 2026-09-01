import express from "express";
import {
  submitApplication,
  listApplications,
  getApplication,
  reviewApplication,
  deleteApplication,
} from "../controllers/applicationController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { publicFormLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/", publicFormLimiter, submitApplication); // public
router.get("/", protect, admin, listApplications);
router.get("/:id", protect, admin, getApplication);
router.patch("/:id/review", protect, admin, reviewApplication);
router.delete("/:id", protect, admin, deleteApplication);

export default router;
