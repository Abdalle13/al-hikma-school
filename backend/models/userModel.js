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
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function matchPassword(entered) {
  return bcrypt.compare(entered, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
