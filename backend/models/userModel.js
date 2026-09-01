import crypto from "crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const guardianSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    relation: {
      type: String,
      enum: ["Father", "Mother", "Guardian", "Other"],
      default: "Guardian",
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    // teachers, parents and admins log in with email. students do not have one.
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
    },

    // students log in with this. staff and parents do not have one.
    admissionNo: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true,
    },

    password: { type: String, required: true, minlength: 6, select: false },

    role: {
      type: String,
      enum: ["Admin", "Teacher", "Parent", "Student"],
      required: true,
    },

    phone: { type: String, trim: true },
    photo: { type: String },

    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },

    // student enrolment fields, unused for other roles
    gender: { type: String, enum: ["Male", "Female"] },
    dob: { type: Date },
    schoolClass: { type: mongoose.Schema.Types.ObjectId, ref: "SchoolClass" },
    enrolledAt: { type: Date },
    enrollmentStatus: {
      type: String,
      enum: ["Enrolled", "Graduated", "Withdrawn"],
      default: undefined,
    },

    // set true by the admin on create, cleared after the user changes it once
    mustChangePassword: { type: Boolean, default: true },

    // only meaningful for a student. the parent's children are found by querying
    // students where guardians.user matches the parent id. never stored twice.
    guardians: { type: [guardianSchema], default: undefined },

    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// hash the password whenever it is set (mongoose 9: plain async hook, no next)
userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = function matchPassword(entered) {
  return bcrypt.compare(entered, this.password);
};

// raw token goes in the email, only the hash and a 30 minute expiry are stored
userSchema.methods.createResetToken = function createResetToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  this.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
  return rawToken;
};

// never leak the password or the reset fields
userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    admissionNo: this.admissionNo,
    role: this.role,
    phone: this.phone,
    photo: this.photo,
    status: this.status,
    mustChangePassword: this.mustChangePassword,
    guardians: this.guardians,
    gender: this.gender,
    dob: this.dob,
    schoolClass: this.schoolClass,
    enrolledAt: this.enrolledAt,
    enrollmentStatus: this.enrollmentStatus,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
