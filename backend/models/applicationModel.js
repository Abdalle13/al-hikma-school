import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    childName: { type: String, required: true, trim: true },
    dob: { type: Date },
    gender: { type: String, enum: ["Male", "Female"] },
    motherName: { type: String, trim: true },
    feeCategory: {
      type: String,
      enum: ["Regular", "Orphan", "Scholarship", "Other"],
      default: "Regular",
    },
    previousSchool: { type: String, trim: true },
    bloodGroup: { type: String, trim: true },
    address: { type: String, trim: true },
    gradeApplyingFor: { type: String, trim: true },
    parentName: { type: String, required: true, trim: true },
    relationship: { type: String, trim: true },
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
