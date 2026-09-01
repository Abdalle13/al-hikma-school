import mongoose from "mongoose";
import Announcement from "../models/announcementModel.js";
import Notification from "../models/notificationModel.js";
import SchoolClass from "../models/schoolClassModel.js";
import User from "../models/userModel.js";
import TeachingAssignment from "../models/teachingAssignmentModel.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const populated = (q) =>
  q.populate("createdBy", "name role").populate("schoolClass", "name section");

// works out who a notification should go to for this announcement and writes
// the simulated message rows. guardians stand in for students.
async function dispatch(announcement) {
  let recipientIds = [];

  if (announcement.audience === "Role") {
    if (announcement.role === "Parent" || announcement.role === "Student") {
      recipientIds = (await User.find({ role: "Parent", status: "Active" }).select("_id")).map((u) => u._id);
    } else {
      recipientIds = (await User.find({ role: announcement.role, status: "Active" }).select("_id")).map(
        (u) => u._id
      );
    }
  } else if (announcement.audience === "Class") {
    const students = await User.find({
      role: "Student",
      schoolClass: announcement.schoolClass,
    }).select("guardians");
    const set = new Set();
    students.forEach((s) => (s.guardians || []).forEach((g) => set.add(String(g.user))));
    recipientIds = [...set].map((id) => new mongoose.Types.ObjectId(id));
  } else {
    // All: every parent
    recipientIds = (await User.find({ role: "Parent", status: "Active" }).select("_id")).map((u) => u._id);
  }

  if (!recipientIds.length) return 0;

  const rows = recipientIds.map((to) => ({
    to,
    channel: "whatsapp",
    content: `${announcement.title}: ${announcement.body}`.slice(0, 500),
    relatedTo: "announcement",
    relatedId: announcement._id,
    status: "sent",
  }));
  await Notification.insertMany(rows);
  return rows.length;
}

async function canTargetClass(user, classId) {
  if (user.role === "Admin") return true;
  const cls = await SchoolClass.findById(classId).select("classTeacher");
  if (cls?.classTeacher?.equals(user._id)) return true;
  return Boolean(await TeachingAssignment.exists({ teacher: user._id, schoolClass: classId }));
}

// POST /api/announcements   (admin, or a teacher for their own class)
export async function createAnnouncement(req, res, next) {
  try {
    const { title, body, audience = "All", role } = req.body;
    if (!title || !body) {
      res.status(400);
      throw new Error("title and body are required");
    }
    if (!["All", "Class", "Role"].includes(audience)) {
      res.status(400);
      throw new Error("audience must be All, Class or Role");
    }

    const isPublic = req.user.role === "Admin" ? Boolean(req.body.isPublic) : false;

    let schoolClass;
    if (audience === "Class") {
      schoolClass = req.body.schoolClass;
      if (!isValidId(schoolClass || "")) {
        res.status(400);
        throw new Error("A valid schoolClass is required for a class announcement");
      }
      if (!(await canTargetClass(req.user, schoolClass))) {
        res.status(403);
        throw new Error("You can only post to your own class");
      }
    } else if (req.user.role !== "Admin") {
      res.status(403);
      throw new Error("Only an admin can post to everyone or to a role");
    }

    if (audience === "Role" && !["Admin", "Teacher", "Parent", "Student"].includes(role)) {
      res.status(400);
      throw new Error("A valid role is required for a role announcement");
    }

    const announcement = await Announcement.create({
      title,
      body,
      audience,
      schoolClass: audience === "Class" ? schoolClass : undefined,
      role: audience === "Role" ? role : undefined,
      isPublic,
      createdBy: req.user._id,
    });

    const sent = await dispatch(announcement);
    res.status(201).json({
      announcement: await populated(Announcement.findById(announcement._id)),
      notificationsSent: sent,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/announcements   scoped to what the caller should see
export async function listAnnouncements(req, res, next) {
  try {
    const u = req.user;
    let filter = {};

    if (u.role === "Admin" || u.role === "Teacher") {
      if (req.query.audience) filter.audience = req.query.audience;
      if (req.query.isPublic === "true") filter.isPublic = true;
      if (req.query.schoolClass && isValidId(req.query.schoolClass)) filter.schoolClass = req.query.schoolClass;
    } else {
      const or = [{ audience: "All" }, { audience: "Role", role: u.role }];
      if (u.role === "Parent") {
        const kids = await User.find({ role: "Student", "guardians.user": u._id }).select("schoolClass");
        const classIds = kids.map((k) => k.schoolClass).filter(Boolean);
        if (classIds.length) or.push({ audience: "Class", schoolClass: { $in: classIds } });
        or.push({ audience: "Role", role: "Parent" });
      }
      if (u.role === "Student" && u.schoolClass) {
        or.push({ audience: "Class", schoolClass: u.schoolClass });
      }
      filter = { $or: or };
    }

    const items = await populated(Announcement.find(filter).sort({ createdAt: -1 }));
    res.json({ announcements: items, total: items.length });
  } catch (err) {
    next(err);
  }
}

// GET /api/announcements/:id
export async function getAnnouncement(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid announcement id");
    }
    const a = await populated(Announcement.findById(req.params.id));
    if (!a) {
      res.status(404);
      throw new Error("Announcement not found");
    }
    res.json({ announcement: a });
  } catch (err) {
    next(err);
  }
}

// PUT /api/announcements/:id   (admin or the creator)
export async function updateAnnouncement(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid announcement id");
    }
    const a = await Announcement.findById(req.params.id);
    if (!a) {
      res.status(404);
      throw new Error("Announcement not found");
    }
    if (req.user.role !== "Admin" && !a.createdBy?.equals(req.user._id)) {
      res.status(403);
      throw new Error("You can only edit your own announcements");
    }
    if (req.body.title !== undefined) a.title = req.body.title;
    if (req.body.body !== undefined) a.body = req.body.body;
    if (req.body.isPublic !== undefined && req.user.role === "Admin") a.isPublic = Boolean(req.body.isPublic);
    await a.save();
    res.json({ announcement: await populated(Announcement.findById(a._id)) });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/announcements/:id   (admin or the creator)
export async function deleteAnnouncement(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid announcement id");
    }
    const a = await Announcement.findById(req.params.id);
    if (!a) {
      res.status(404);
      throw new Error("Announcement not found");
    }
    if (req.user.role !== "Admin" && !a.createdBy?.equals(req.user._id)) {
      res.status(403);
      throw new Error("You can only delete your own announcements");
    }
    await a.deleteOne();
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    next(err);
  }
}

// GET /api/announcements/public   (no auth)  the website news list
export async function listPublic(req, res, next) {
  try {
    const items = await Announcement.find({ isPublic: true })
      .select("title body createdAt")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ announcements: items, total: items.length });
  } catch (err) {
    next(err);
  }
}

// GET /api/announcements/public/:id   (no auth)  a single website article
export async function getPublic(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid announcement id");
    }
    const a = await Announcement.findOne({ _id: req.params.id, isPublic: true }).select(
      "title body createdAt"
    );
    if (!a) {
      res.status(404);
      throw new Error("Article not found");
    }
    res.json({ announcement: a });
  } catch (err) {
    next(err);
  }
}
