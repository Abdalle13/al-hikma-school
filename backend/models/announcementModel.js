import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    audience: { type: String, enum: ["All", "Class", "Role"], default: "All" },
    schoolClass: { type: mongoose.Schema.Types.ObjectId, ref: "SchoolClass" }, // when audience Class
    role: { type: String, enum: ["Admin", "Teacher", "Parent", "Student"] }, // when audience Role
    isPublic: { type: Boolean, default: false }, // also shows on the public website
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Announcement =
  mongoose.models.Announcement || mongoose.model("Announcement", announcementSchema);

export default Announcement;
