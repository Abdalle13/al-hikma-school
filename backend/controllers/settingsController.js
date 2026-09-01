import mongoose from "mongoose";
import Settings from "../models/settingsModel.js";
import Term from "../models/termModel.js";

const PUBLIC_FIELDS = [
  "schoolName",
  "tagline",
  "about",
  "address",
  "phone",
  "email",
  "logo",
  "currency",
  "mobileMoneyOperators",
  "socials",
];

function pickPublic(doc) {
  const out = {};
  for (const f of PUBLIC_FIELDS) out[f] = doc[f];
  return out;
}

// GET /api/settings   (public)  the website reads school name, contacts, etc
export async function getPublicSettings(req, res, next) {
  try {
    const settings = await Settings.getSingleton();
    res.json({ settings: pickPublic(settings) });
  } catch (err) {
    next(err);
  }
}

// GET /api/settings/admin   (admin)  everything
export async function getSettings(req, res, next) {
  try {
    const settings = await Settings.getSingleton();
    await settings.populate("currentTerm", "name academicYear isActive");
    res.json({ settings });
  } catch (err) {
    next(err);
  }
}

// PUT /api/settings   (admin)
export async function updateSettings(req, res, next) {
  try {
    const settings = await Settings.getSingleton();

    const fields = [
      "schoolName",
      "tagline",
      "about",
      "address",
      "phone",
      "email",
      "logo",
      "currency",
    ];
    for (const f of fields) if (req.body[f] !== undefined) settings[f] = req.body[f];

    if (Array.isArray(req.body.mobileMoneyOperators)) {
      settings.mobileMoneyOperators = req.body.mobileMoneyOperators.map(String);
    }
    if (req.body.socials && typeof req.body.socials === "object") {
      settings.socials = { ...settings.socials.toObject?.() ?? settings.socials, ...req.body.socials };
    }
    if (req.body.currentTerm !== undefined) {
      if (req.body.currentTerm === null || req.body.currentTerm === "") {
        settings.currentTerm = undefined;
      } else {
        if (!mongoose.Types.ObjectId.isValid(req.body.currentTerm)) {
          res.status(400);
          throw new Error("Invalid currentTerm id");
        }
        const term = await Term.findById(req.body.currentTerm);
        if (!term) {
          res.status(404);
          throw new Error("Term not found");
        }
        settings.currentTerm = term._id;
      }
    }

    await settings.save();
    await settings.populate("currentTerm", "name academicYear isActive");
    res.json({ settings });
  } catch (err) {
    next(err);
  }
}
