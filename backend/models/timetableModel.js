import mongoose from "mongoose";

const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const entrySchema = new mongoose.Schema(
  {
    day: { type: String, enum: DAYS, required: true },
    period: { type: Number, min: 1 },
    startTime: { type: String, required: true }, // "08:00"
    endTime: { type: String, required: true }, // "08:45"
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { _id: false }
);

const timetableSchema = new mongoose.Schema(
  {
    schoolClass: { type: mongoose.Schema.Types.ObjectId, ref: "SchoolClass", required: true },
    academicYear: { type: String, required: true, trim: true },
    entries: { type: [entrySchema], default: [] },
  },
  { timestamps: true }
);

timetableSchema.index({ schoolClass: 1, academicYear: 1 }, { unique: true });

const Timetable = mongoose.models.Timetable || mongoose.model("Timetable", timetableSchema);

export { DAYS };
export default Timetable;
