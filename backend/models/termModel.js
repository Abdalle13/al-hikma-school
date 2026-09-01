import mongoose from "mongoose";

const termSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Term 1"
    academicYear: { type: String, required: true, trim: true }, // e.g. "2025/2026"
    startDate: { type: Date, required: true },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function afterStart(value) {
          return !this.startDate || value > this.startDate;
        },
        message: "End date must be after the start date",
      },
    },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

termSchema.index({ name: 1, academicYear: 1 }, { unique: true });

const Term = mongoose.models.Term || mongoose.model("Term", termSchema);

export default Term;
