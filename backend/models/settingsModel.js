import mongoose from "mongoose";

// a single document holds the whole school configuration
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "school", unique: true },
    schoolName: { type: String, default: "School Name", trim: true },
    tagline: { type: String, default: "", trim: true },
    about: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true },
    logo: { type: String, default: "" },
    currentTerm: { type: mongoose.Schema.Types.ObjectId, ref: "Term" },
    currency: { type: String, default: "USD", trim: true },
    mobileMoneyOperators: { type: [String], default: ["EVC Plus", "Zaad"] },
    socials: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

settingsSchema.statics.getSingleton = async function getSingleton() {
  let doc = await this.findOne({ key: "school" });
  if (!doc) doc = await this.create({ key: "school" });
  return doc;
};

const Settings = mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

export default Settings;
