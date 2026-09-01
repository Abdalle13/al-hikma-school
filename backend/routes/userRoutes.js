import express from "express";
import {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  addGuardian,
  removeGuardian,
  listChildren,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// a parent can read their own children, everything else is admin only
router.get("/:id/children", protect, listChildren);

router.use(protect, admin);

router.route("/").get(listUsers).post(createUser);
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);
router.post("/:id/guardians", addGuardian);
router.delete("/:id/guardians/:parentId", removeGuardian);

export default router;
