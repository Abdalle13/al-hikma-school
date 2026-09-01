import mongoose from "mongoose";

// one row means: this teacher teaches this subject to this class.
// timetable (b7) and exams (b5) build on these rows.
const teachingAssignmentSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    schoolClass: { type: mongoose.Schema.Types.ObjectId, ref: "SchoolClass", required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    academicYear: { type: String, trim: true },
  },
  { timestamps: true }
);

teachingAssignmentSchema.index(
  { teacher: 1, schoolClass: 1, subject: 1 },
  { unique: true }
);

const TeachingAssignment =
  mongoose.models.TeachingAssignment ||
  mongoose.model("TeachingAssignment", teachingAssignmentSchema);

export default TeachingAssignment;
