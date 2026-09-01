import express from "express";
import {
  submitContact,
  listContact,
  updateContact,
  deleteContact,
} from "../controllers/contactController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { publicFormLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/", publicFormLimiter, submitContact); // public
router.get("/", protect, admin, listContact);
router.patch("/:id", protect, admin, updateContact);
router.delete("/:id", protect, admin, deleteContact);

export default router;
