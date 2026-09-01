import express from "express";
import { listStaff, getStaff } from "../controllers/assignmentController.js";
import { protect, admin, teacher } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, admin, listStaff);
router.get("/:id", protect, teacher, getStaff); // a teacher may read their own

export default router;
