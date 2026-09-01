import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Excused"],
      required: true,
    },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true }, // stored at start of day, utc
    schoolClass: { type: mongoose.Schema.Types.ObjectId, ref: "SchoolClass", required: true },
    term: { type: mongoose.Schema.Types.ObjectId, ref: "Term" },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    records: { type: [recordSchema], default: [] },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

// one attendance record per class per day
attendanceSchema.index({ schoolClass: 1, date: 1 }, { unique: true });

const Attendance =
  mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);

export default Attendance;
