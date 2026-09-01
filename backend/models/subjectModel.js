import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    // "Primary", "Secondary", or a specific grade like "Grade 4". free text on purpose.
    gradeLevel: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

const Subject = mongoose.models.Subject || mongoose.model("Subject", subjectSchema);

export default Subject;
