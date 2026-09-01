import express from "express";
import { studentMarks } from "../controllers/examController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/marks?student=&term=   scoped in the controller
router.get("/", protect, studentMarks);

export default router;
