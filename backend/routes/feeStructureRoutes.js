import express from "express";
import {
  createFeeStructure,
  listFeeStructures,
  getFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
} from "../controllers/feeStructureController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, listFeeStructures);
router.get("/:id", protect, getFeeStructure);
router.post("/", protect, admin, createFeeStructure);
router.put("/:id", protect, admin, updateFeeStructure);
router.delete("/:id", protect, admin, deleteFeeStructure);

export default router;
