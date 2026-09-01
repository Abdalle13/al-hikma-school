import crypto from "crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["Admin", "Teacher", "Parent", "Student"],
      default: "Parent",
    },
    phone: { type: String, trim: true },
    photo: { type: String },
    status: { type: String, enum: ["Active", "Inactive"], default: "Inactive" },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// hash the password whenever it is set
userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = function matchPassword(entered) {
  return bcrypt.compare(entered, this.password);
};

// makes a raw reset token to email, stores only the hash and a 30 minute expiry
userSchema.methods.createResetToken = function createResetToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  this.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
  return rawToken;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
