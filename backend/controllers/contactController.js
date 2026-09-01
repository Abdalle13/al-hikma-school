import mongoose from "mongoose";
import ContactMessage from "../models/contactMessageModel.js";
import Settings from "../models/settingsModel.js";
import sendEmail from "../utils/sendEmail.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /api/contact   (public)
export async function submitContact(req, res, next) {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      res.status(400);
      throw new Error("Name, email and message are required");
    }

    const doc = await ContactMessage.create({
      name,
      email,
      subject: req.body.subject,
      message,
    });

    // best effort: forward to the school inbox, never block the response on it
    const settings = await Settings.getSingleton();
    const to = settings.email || process.env.EMAIL_USER;
    if (to) {
      try {
        await sendEmail({
          to,
          subject: `Website contact: ${req.body.subject || "no subject"}`,
          text: `From ${name} <${email}>\n\n${message}`,
        });
        doc.emailForwarded = true;
        await doc.save();
      } catch {
        // leave emailForwarded false, the admin still sees it in the log
      }
    }

    res.status(201).json({ message: "Thanks, your message has been sent." });
  } catch (err) {
    next(err);
  }
}

// GET /api/contact   (admin)   ?handled=true|false
export async function listContact(req, res, next) {
  try {
    const filter = {};
    if (req.query.handled === "true") filter.handled = true;
    if (req.query.handled === "false") filter.handled = false;
    const messages = await ContactMessage.find(filter).sort({ createdAt: -1 });
    res.json({ messages, total: messages.length });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/contact/:id   (admin)   body: { handled }
export async function updateContact(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid message id");
    }
    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { handled: req.body.handled !== false },
      { returnDocument: "after" }
    );
    if (!msg) {
      res.status(404);
      throw new Error("Message not found");
    }
    res.json({ message: msg });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/contact/:id   (admin)
export async function deleteContact(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid message id");
    }
    const msg = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!msg) {
      res.status(404);
      throw new Error("Message not found");
    }
    res.json({ message: "Message deleted" });
  } catch (err) {
    next(err);
  }
}
