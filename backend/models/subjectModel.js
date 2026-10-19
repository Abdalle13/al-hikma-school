import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    department: { type: String, trim: true, default: "General Academics" },
    gradeLevel: { type: String, trim: true },
    periodsPerWeek: { type: Number, default: 5 },
    passMarks: { type: Number, default: 50 },
    totalMarks: { type: Number, default: 100 },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

const Subject = mongoose.models.Subject || mongoose.model("Subject", subjectSchema);

export default Subject;
