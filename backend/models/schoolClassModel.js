import mongoose from "mongoose";

const schoolClassSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Grade 4"
    section: { type: String, trim: true, default: "" }, // e.g. "A"
    academicYear: { type: String, required: true, trim: true }, // e.g. "2025/2026"
    classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
    capacity: { type: Number, default: 40, min: 1 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// one class per name + section + year
schoolClassSchema.index({ name: 1, section: 1, academicYear: 1 }, { unique: true });

schoolClassSchema.virtual("fullName").get(function fullName() {
  return this.section ? `${this.name} ${this.section}` : this.name;
});

const SchoolClass =
  mongoose.models.SchoolClass || mongoose.model("SchoolClass", schoolClassSchema);

export default SchoolClass;
