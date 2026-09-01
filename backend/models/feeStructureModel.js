import mongoose from "mongoose";

const lineItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true }, // e.g. "Tuition", "Transport", "Books"
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const feeStructureSchema = new mongoose.Schema(
  {
    schoolClass: { type: mongoose.Schema.Types.ObjectId, ref: "SchoolClass", required: true },
    term: { type: mongoose.Schema.Types.ObjectId, ref: "Term", required: true },
    lineItems: { type: [lineItemSchema], default: [] },
    total: { type: Number, default: 0 },
  },
  { timestamps: true }
);

feeStructureSchema.index({ schoolClass: 1, term: 1 }, { unique: true });

feeStructureSchema.pre("save", function computeTotal() {
  this.total = (this.lineItems || []).reduce((sum, li) => sum + (li.amount || 0), 0);
});

const FeeStructure =
  mongoose.models.FeeStructure || mongoose.model("FeeStructure", feeStructureSchema);

export default FeeStructure;
