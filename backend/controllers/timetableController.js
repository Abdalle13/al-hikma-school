import mongoose from "mongoose";
import Timetable, { DAYS } from "../models/timetableModel.js";
import SchoolClass from "../models/schoolClassModel.js";
import User from "../models/userModel.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const populated = (q) =>
  q
    .populate("schoolClass", "name section academicYear")
    .populate("entries.subject", "name code")
    .populate("entries.teacher", "name email");

function overlaps(a, b) {
  return a.day === b.day && a.startTime < b.endTime && b.startTime < a.endTime;
}

// PUT /api/timetable  (admin)  body: { schoolClass, academicYear, entries: [...] }
// creates or fully replaces the timetable for one class
export async function saveTimetable(req, res, next) {
  try {
    const { schoolClass, entries } = req.body;
    if (!isValidId(schoolClass || "")) {
      res.status(400);
      throw new Error("A valid schoolClass id is required");
    }
    if (!Array.isArray(entries)) {
      res.status(400);
      throw new Error("entries must be an array");
    }

    const cls = await SchoolClass.findById(schoolClass).populate("subjects", "_id");
    if (!cls) {
      res.status(404);
      throw new Error("Class not found");
    }
    const academicYear = (req.body.academicYear || cls.academicYear || "").trim();
    if (!academicYear) {
      res.status(400);
      throw new Error("academicYear is required");
    }

    const classSubjects = new Set(cls.subjects.map((s) => String(s._id)));

    // validate each entry
    const clean = [];
    for (const e of entries) {
      if (!DAYS.includes(e.day)) {
        res.status(400);
        throw new Error(`day must be one of ${DAYS.join(", ")}`);
      }
      if (!TIME.test(e.startTime || "") || !TIME.test(e.endTime || "")) {
        res.status(400);
        throw new Error("startTime and endTime must be HH:MM");
      }
      if (e.endTime <= e.startTime) {
        res.status(400);
        throw new Error("endTime must be after startTime");
      }
      if (!isValidId(e.subject || "") || !classSubjects.has(String(e.subject))) {
        res.status(400);
        throw new Error("Every entry subject must be on the class subject list");
      }
      if (!isValidId(e.teacher || "")) {
        res.status(400);
        throw new Error("Every entry needs a valid teacher id");
      }
      clean.push({
        day: e.day,
        period: e.period,
        startTime: e.startTime,
        endTime: e.endTime,
        subject: e.subject,
        teacher: e.teacher,
      });
    }

    // teachers must exist and be active teachers
    const teacherIds = [...new Set(clean.map((e) => String(e.teacher)))];
    const teachers = await User.find({ _id: { $in: teacherIds }, role: "Teacher" }).select("status name");
    if (teachers.length !== teacherIds.length) {
      res.status(400);
      throw new Error("One or more entry teachers are not teachers");
    }

    // no two entries clash within this class
    for (let i = 0; i < clean.length; i += 1) {
      for (let j = i + 1; j < clean.length; j += 1) {
        if (overlaps(clean[i], clean[j])) {
          res.status(409);
          throw new Error(`Two entries clash on ${clean[i].day} at ${clean[i].startTime}`);
        }
      }
    }

    // no teacher double booked against other classes
    const others = await Timetable.find({
      schoolClass: { $ne: cls._id },
      "entries.teacher": { $in: teacherIds },
    }).populate("schoolClass", "name section");
    for (const e of clean) {
      for (const other of others) {
        for (const oe of other.entries) {
          if (String(oe.teacher) === String(e.teacher) && overlaps(e, oe)) {
            res.status(409);
            throw new Error(
              `A teacher is already booked in ${other.schoolClass.name} on ${e.day} at ${e.startTime}`
            );
          }
        }
      }
    }

    const existing = await Timetable.findOne({ schoolClass: cls._id, academicYear });
    let timetable;
    if (existing) {
      existing.entries = clean;
      timetable = await existing.save();
    } else {
      timetable = await Timetable.create({ schoolClass: cls._id, academicYear, entries: clean });
    }

    res.status(existing ? 200 : 201).json({
      timetable: await populated(Timetable.findById(timetable._id)),
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/timetable/class/:classId
export async function getClassTimetable(req, res, next) {
  try {
    if (!isValidId(req.params.classId)) {
      res.status(400);
      throw new Error("Invalid class id");
    }
    // a parent or student can only see their own class
    if (req.user.role === "Student") {
      if (String(req.user.schoolClass) !== req.params.classId) {
        res.status(403);
        throw new Error("You can only see your own class timetable");
      }
    } else if (req.user.role === "Parent") {
      const ok = await User.exists({
        role: "Student",
        schoolClass: req.params.classId,
        "guardians.user": req.user._id,
      });
      if (!ok) {
        res.status(403);
        throw new Error("None of your children are in that class");
      }
    }

    const timetable = await populated(Timetable.findOne({ schoolClass: req.params.classId }));
    if (!timetable) {
      res.status(404);
      throw new Error("No timetable for that class yet");
    }
    res.json({ timetable });
  } catch (err) {
    next(err);
  }
}

// GET /api/timetable/teacher/:teacherId   (admin, or the teacher themselves)
export async function getTeacherTimetable(req, res, next) {
  try {
    if (!isValidId(req.params.teacherId)) {
      res.status(400);
      throw new Error("Invalid teacher id");
    }
    if (req.user.role === "Teacher" && !req.user._id.equals(req.params.teacherId)) {
      res.status(403);
      throw new Error("You can only see your own timetable");
    }
    if (req.user.role === "Parent" || req.user.role === "Student") {
      res.status(403);
      throw new Error("Not allowed");
    }

    const tables = await populated(
      Timetable.find({ "entries.teacher": req.params.teacherId })
    );
    const slots = [];
    for (const t of tables) {
      for (const e of t.entries) {
        if (String(e.teacher?._id || e.teacher) === req.params.teacherId) {
          slots.push({
            schoolClass: t.schoolClass,
            day: e.day,
            period: e.period,
            startTime: e.startTime,
            endTime: e.endTime,
            subject: e.subject,
          });
        }
      }
    }
    slots.sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.startTime.localeCompare(b.startTime));
    res.json({ teacher: req.params.teacherId, slots, total: slots.length });
  } catch (err) {
    next(err);
  }
}

// GET /api/timetable/me   convenience: teacher gets their slots, student gets their class
export async function myTimetable(req, res, next) {
  try {
    if (req.user.role === "Teacher") {
      req.params.teacherId = String(req.user._id);
      return getTeacherTimetable(req, res, next);
    }
    if (req.user.role === "Student") {
      if (!req.user.schoolClass) {
        res.status(404);
        throw new Error("You are not in a class yet");
      }
      req.params.classId = String(req.user.schoolClass);
      return getClassTimetable(req, res, next);
    }
    res.status(400);
    throw new Error("Use the class or teacher timetable endpoints");
  } catch (err) {
    next(err);
  }
}

// DELETE /api/timetable/:id  (admin)
export async function deleteTimetable(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid timetable id");
    }
    const t = await Timetable.findById(req.params.id);
    if (!t) {
      res.status(404);
      throw new Error("Timetable not found");
    }
    await t.deleteOne();
    res.json({ message: "Timetable deleted" });
  } catch (err) {
    next(err);
  }
}
