import mongoose from "mongoose";

const examLineSchema = new mongoose.Schema(
  {
    title: { type: String },
    type: { type: String },
    score: { type: Number },
    max: { type: Number },
  },
  { _id: false }
);

const subjectLineSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    subjectName: String,
    subjectCode: String,
    score: Number, // total score across the subject's exams this term
    max: Number, // total max across those exams
    percentage: Number,
    grade: String,
    exams: { type: [examLineSchema], default: [] },
  },
  { _id: false }
);

// cached per student per term. recomputed by the generate endpoint.
const reportCardSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    term: { type: mongoose.Schema.Types.ObjectId, ref: "Term", required: true },
    schoolClass: { type: mongoose.Schema.Types.ObjectId, ref: "SchoolClass" },
    subjects: { type: [subjectLineSchema], default: [] },
    average: Number,
    overallGrade: String,
    division: String,
    position: Number,
    totalStudents: Number,
    remark: { type: String, trim: true },
    published: { type: Boolean, default: false },
    generatedAt: Date,
  },
  { timestamps: true }
);

reportCardSchema.index({ student: 1, term: 1 }, { unique: true });

const ReportCard =
  mongoose.models.ReportCard || mongoose.model("ReportCard", reportCardSchema);

export default ReportCard;
