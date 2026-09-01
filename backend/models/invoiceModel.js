import mongoose from "mongoose";

const lineItemSchema = new mongoose.Schema(
  { label: { type: String, required: true }, amount: { type: Number, required: true, min: 0 } },
  { _id: false }
);

const installmentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    paid: { type: Boolean, default: false },
    paidAt: { type: Date },
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    method: { type: String, enum: ["evc", "zaad", "cash"], required: true },
    reference: { type: String },
    phone: { type: String },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const invoiceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    term: { type: mongoose.Schema.Types.ObjectId, ref: "Term", required: true },
    schoolClass: { type: mongoose.Schema.Types.ObjectId, ref: "SchoolClass" },
    lineItems: { type: [lineItemSchema], default: [] },
    total: { type: Number, required: true, min: 0 },
    dueDate: { type: Date },
    status: { type: String, enum: ["Unpaid", "Partial", "Paid"], default: "Unpaid" },
    installmentPlan: {
      enabled: { type: Boolean, default: false },
      installments: { type: [installmentSchema], default: [] },
    },
    payments: { type: [paymentSchema], default: [] },
    amountPaid: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

invoiceSchema.index({ student: 1, term: 1 }, { unique: true });

// recomputes amountPaid, balance, status and the installment paid flags from
// the payments list. call before every save that touched payments or total.
invoiceSchema.methods.recalculate = function recalculate() {
  const paid = (this.payments || []).reduce((s, p) => s + (p.amount || 0), 0);
  this.amountPaid = Math.round(paid * 100) / 100;
  this.balance = Math.round((this.total - paid) * 100) / 100;
  this.status = this.balance <= 0 ? "Paid" : this.amountPaid > 0 ? "Partial" : "Unpaid";

  if (this.installmentPlan?.enabled) {
    let running = 0;
    for (const inst of this.installmentPlan.installments) {
      running += inst.amount;
      const covered = this.amountPaid + 0.001 >= running;
      if (covered && !inst.paid) {
        inst.paid = true;
        inst.paidAt = new Date();
      } else if (!covered) {
        inst.paid = false;
        inst.paidAt = undefined;
      }
    }
  }
  return this;
};

const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);

export default Invoice;
