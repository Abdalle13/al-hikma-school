import mongoose from "mongoose";
import Notification from "../models/notificationModel.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/notifications
// a parent (or any non admin) sees only their own. an admin sees the whole log
// and can filter by to, channel, relatedTo.
export async function listNotifications(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

    const filter = {};
    if (req.user.role !== "Admin") {
      filter.to = req.user._id;
    } else {
      if (req.query.to && isValidId(req.query.to)) filter.to = req.query.to;
      if (req.query.channel) filter.channel = req.query.channel;
      if (req.query.relatedTo) filter.relatedTo = req.query.relatedTo;
    }
    if (req.query.unread === "true") filter.readAt = { $exists: false };

    const [items, total, unread] = await Promise.all([
      Notification.find(filter)
        .populate("to", "name email role")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ to: req.user._id, readAt: { $exists: false } }),
    ]);

    res.json({ notifications: items, total, page, pages: Math.ceil(total / limit) || 1, unread });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/notifications/:id/read   (the recipient only)
export async function markRead(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid notification id");
    }
    const n = await Notification.findById(req.params.id);
    if (!n) {
      res.status(404);
      throw new Error("Notification not found");
    }
    if (!n.to.equals(req.user._id) && req.user.role !== "Admin") {
      res.status(403);
      throw new Error("Not your notification");
    }
    if (!n.readAt) {
      n.readAt = new Date();
      await n.save();
    }
    res.json({ notification: n });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/notifications/read-all   (mark all of mine read)
export async function markAllRead(req, res, next) {
  try {
    const result = await Notification.updateMany(
      { to: req.user._id, readAt: { $exists: false } },
      { $set: { readAt: new Date() } }
    );
    res.json({ updated: result.modifiedCount });
  } catch (err) {
    next(err);
  }
}
