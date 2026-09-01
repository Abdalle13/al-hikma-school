import express from "express";
import {
  generateInvoices,
  listInvoices,
  getInvoice,
  updateInvoice,
  setInstallmentPlan,
  clearInstallmentPlan,
  payInvoice,
  recordCash,
  invoiceReceipt,
  balances,
} from "../controllers/invoiceController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", protect, admin, generateInvoices);
router.get("/balances", protect, admin, balances);

router.get("/", protect, listInvoices);
router.get("/:id", protect, getInvoice);
router.get("/:id/receipt", protect, invoiceReceipt);

router.put("/:id", protect, admin, updateInvoice);
router.post("/:id/installment-plan", protect, admin, setInstallmentPlan);
router.delete("/:id/installment-plan", protect, admin, clearInstallmentPlan);
router.post("/:id/pay", protect, payInvoice); // parent of the student or admin
router.post("/:id/record-cash", protect, admin, recordCash);

export default router;
