import express from "express";
import {
  createStudent,
  listStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  suggestAdmissionNo,
} from "../controllers/studentController.js";
import { addGuardian, removeGuardian } from "../controllers/userController.js";
import { protect, admin, teacher } from "../middleware/authMiddleware.js";

const router = express.Router();

// teachers and admins can read the student roster
router.get("/", protect, teacher, listStudents);
router.get("/next-admission-no", protect, admin, suggestAdmissionNo);
router.get("/:id", protect, teacher, getStudent);

// admin only writes
router.post("/", protect, admin, createStudent);
router.put("/:id", protect, admin, updateStudent);
router.delete("/:id", protect, admin, deleteStudent);

// parent to student linking, same handlers as /api/users/:id/guardians
router.post("/:id/guardians", protect, admin, addGuardian);
router.delete("/:id/guardians/:parentId", protect, admin, removeGuardian);

export default router;
