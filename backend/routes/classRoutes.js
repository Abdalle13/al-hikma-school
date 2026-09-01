import express from "express";
import {
  createClass,
  listClasses,
  getClass,
  updateClass,
  deleteClass,
  addSubjectToClass,
  removeSubjectFromClass,
} from "../controllers/classController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, listClasses);
router.get("/:id", protect, getClass);

router.post("/", protect, admin, createClass);
router.put("/:id", protect, admin, updateClass);
router.delete("/:id", protect, admin, deleteClass);
router.post("/:id/subjects", protect, admin, addSubjectToClass);
router.delete("/:id/subjects/:subjectId", protect, admin, removeSubjectFromClass);

export default router;
