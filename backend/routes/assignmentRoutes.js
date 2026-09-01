import express from "express";
import {
  createAssignment,
  listAssignments,
  deleteAssignment,
} from "../controllers/assignmentController.js";
import { protect, admin, teacher } from "../middleware/authMiddleware.js";

const router = express.Router();

// a teacher can list (scoped to their own rows), only an admin writes
router.get("/", protect, teacher, listAssignments);
router.post("/", protect, admin, createAssignment);
router.delete("/:id", protect, admin, deleteAssignment);

export default router;
