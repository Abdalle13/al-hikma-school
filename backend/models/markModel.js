import mongoose from "mongoose";

const markSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true, min: 0 },
    remark: { type: String, trim: true },
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

markSchema.index({ exam: 1, student: 1 }, { unique: true });

const Mark = mongoose.models.Mark || mongoose.model("Mark", markSchema);

export default Mark;
