import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    childName: { type: String, required: true, trim: true },
    dob: { type: Date },
    gender: { type: String, enum: ["Male", "Female"] },
    gradeApplyingFor: { type: String, trim: true },
    parentName: { type: String, required: true, trim: true },
    parentPhone: { type: String, required: true, trim: true },
    parentEmail: { type: String, trim: true, lowercase: true },
    message: { type: String, trim: true },
    status: {
      type: String,
      enum: ["New", "Reviewing", "Accepted", "Rejected"],
      default: "New",
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewNote: { type: String, trim: true },
    createdStudent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Application =
  mongoose.models.Application || mongoose.model("Application", applicationSchema);

export default Application;
