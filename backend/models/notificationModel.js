import mongoose from "mongoose";

// a simulated sms / whatsapp / email message. nothing is really sent, the row
// is the record and the admin message log (b8) reads from here.
const notificationSchema = new mongoose.Schema(
  {
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    channel: {
      type: String,
      enum: ["whatsapp", "sms", "email"],
      default: "whatsapp",
    },
    content: { type: String, required: true },
    relatedTo: {
      type: String,
      enum: ["attendance", "fee", "announcement", "account"],
    },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    status: { type: String, enum: ["sent", "failed"], default: "sent" },
    readAt: { type: Date },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Notification =
  mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

export default Notification;
