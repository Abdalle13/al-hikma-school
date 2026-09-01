import express from "express";
import {
  createTerm,
  listTerms,
  getActiveTerm,
  getTerm,
  updateTerm,
  activateTerm,
  deleteTerm,
} from "../controllers/termController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, listTerms);
router.get("/active", protect, getActiveTerm);
router.get("/:id", protect, getTerm);

router.post("/", protect, admin, createTerm);
router.put("/:id", protect, admin, updateTerm);
router.post("/:id/activate", protect, admin, activateTerm);
router.delete("/:id", protect, admin, deleteTerm);

export default router;
