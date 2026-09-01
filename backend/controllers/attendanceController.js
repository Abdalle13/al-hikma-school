import mongoose from "mongoose";
import Attendance from "../models/attendanceModel.js";
import SchoolClass from "../models/schoolClassModel.js";
import Term from "../models/termModel.js";
import User from "../models/userModel.js";
import TeachingAssignment from "../models/teachingAssignmentModel.js";
import { notifyGuardians } from "../utils/notify.js";
import { startOfDayUTC } from "../utils/dates.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const STATUSES = ["Present", "Absent", "Late", "Excused"];

// admin, the class teacher, or a teacher assigned to that class may mark it
async function canMarkClass(user, schoolClassId) {
  if (user.role === "Admin") return true;
  if (user.role !== "Teacher") return false;
  const cls = await SchoolClass.findById(schoolClassId).select("classTeacher");
  if (cls?.classTeacher?.equals(user._id)) return true;
  const assigned = await TeachingAssignment.exists({ teacher: user._id, schoolClass: schoolClassId });
  return Boolean(assigned);
}

// POST /api/attendance
// body: { schoolClass, date, records: [{ student, status }], note }
export async function markAttendance(req, res, next) {
  try {
    const { schoolClass, records, note } = req.body;
    if (!isValidId(schoolClass || "")) {
      res.status(400);
      throw new Error("A valid class id is required");
    }
    if (!Array.isArray(records) || records.length === 0) {
      res.status(400);
      throw new Error("records must be a non empty array");
    }

    const day = startOfDayUTC(req.body.date);
    if (!day) {
      res.status(400);
      throw new Error("Invalid date");
    }
    if (day.getTime() > startOfDayUTC(new Date()).getTime()) {
      res.status(400);
      throw new Error("You cannot mark attendance for a future date");
    }

    if (!(await canMarkClass(req.user, schoolClass))) {
      res.status(403);
      throw new Error("You cannot mark attendance for this class");
    }

    const cls = await SchoolClass.findById(schoolClass);
    if (!cls) {
      res.status(404);
      throw new Error("Class not found");
    }

    // every record must be an enrolled student of this class
    const roster = await User.find({
      role: "Student",
      schoolClass: cls._id,
      enrollmentStatus: "Enrolled",
    }).select("name admissionNo guardians");
    const rosterIds = new Set(roster.map((s) => String(s._id)));

    const clean = [];
    for (const r of records) {
      if (!isValidId(r.student || "") || !rosterIds.has(String(r.student))) {
        res.status(400);
        throw new Error("Every record must be an enrolled student of this class");
      }
      if (!STATUSES.includes(r.status)) {
        res.status(400);
        throw new Error(`status must be one of ${STATUSES.join(", ")}`);
      }
      clean.push({ student: r.student, status: r.status });
    }

    const term = await Term.findOne({ isActive: true }).select("_id");

    const existing = await Attendance.findOne({ schoolClass: cls._id, date: day });
    const previousAbsent = new Set(
      (existing?.records || []).filter((r) => r.status === "Absent").map((r) => String(r.student))
    );

    let attendance;
    if (existing) {
      existing.records = clean;
      existing.note = note;
      existing.markedBy = req.user._id;
      existing.term = term?._id;
      attendance = await existing.save();
    } else {
      attendance = await Attendance.create({
        date: day,
        schoolClass: cls._id,
        term: term?._id,
        markedBy: req.user._id,
        records: clean,
        note,
      });
    }

    // notify a guardian for each student newly marked Absent
    const newlyAbsent = clean
      .filter((r) => r.status === "Absent" && !previousAbsent.has(String(r.student)))
      .map((r) => String(r.student));

    let notified = 0;
    if (newlyAbsent.length) {
      const dateLabel = day.toISOString().slice(0, 10);
      for (const student of roster) {
        if (!newlyAbsent.includes(String(student._id))) continue;
        const rows = await notifyGuardians(student, {
          channel: "whatsapp",
          content: `${student.name} was marked absent from ${cls.name}${cls.section ? " " + cls.section : ""} on ${dateLabel}.`,
          relatedTo: "attendance",
          relatedId: attendance._id,
          meta: { date: dateLabel },
        });
        notified += rows.length;
      }
    }

    res.status(existing ? 200 : 201).json({
      attendance: await Attendance.findById(attendance._id)
        .populate("records.student", "name admissionNo")
        .populate("markedBy", "name role"),
      notificationsSent: notified,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/attendance
// query: schoolClass, date  (one day for a class)
//        student            (that student's history, flattened)
//        dateFrom, dateTo, status
export async function listAttendance(req, res, next) {
  try {
    const { schoolClass, student, date, dateFrom, dateTo, status } = req.query;

    // student history view
    if (student) {
      if (!isValidId(student)) {
        res.status(400);
        throw new Error("Invalid student id");
      }
      if (!(await canViewStudent(req.user, student))) {
        res.status(403);
        throw new Error("You do not have access to this student");
      }
      const match = { "records.student": new mongoose.Types.ObjectId(student) };
      if (dateFrom || dateTo) {
        match.date = {};
        if (dateFrom) match.date.$gte = startOfDayUTC(dateFrom);
        if (dateTo) match.date.$lte = startOfDayUTC(dateTo);
      }
      const rows = await Attendance.find(match)
        .populate("schoolClass", "name section")
        .sort({ date: -1 });
      const history = rows
        .map((row) => {
          const rec = row.records.find((r) => String(r.student) === String(student));
          return rec
            ? { date: row.date, status: rec.status, schoolClass: row.schoolClass, attendanceId: row._id }
            : null;
        })
        .filter(Boolean)
        .filter((h) => !status || h.status === status);
      return res.json({ history, total: history.length });
    }

    // class day view / class range is staff only
    if (req.user.role !== "Admin" && req.user.role !== "Teacher") {
      res.status(403);
      throw new Error("Use the student query to see a specific student's attendance");
    }

    const filter = {};
    if (schoolClass && isValidId(schoolClass)) filter.schoolClass = schoolClass;
    if (date) filter.date = startOfDayUTC(date);
    else if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = startOfDayUTC(dateFrom);
      if (dateTo) filter.date.$lte = startOfDayUTC(dateTo);
    }

    const rows = await Attendance.find(filter)
      .populate("schoolClass", "name section")
      .populate("markedBy", "name role")
      .populate("records.student", "name admissionNo")
      .sort({ date: -1 });

    res.json({ attendance: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
}

// GET /api/attendance/:id
export async function getAttendance(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid attendance id");
    }
    const row = await Attendance.findById(req.params.id)
      .populate("schoolClass", "name section academicYear")
      .populate("markedBy", "name role")
      .populate("records.student", "name admissionNo");
    if (!row) {
      res.status(404);
      throw new Error("Attendance record not found");
    }
    res.json({ attendance: row });
  } catch (err) {
    next(err);
  }
}

// GET /api/attendance/summary/:studentId
export async function studentSummary(req, res, next) {
  try {
    const { studentId } = req.params;
    if (!isValidId(studentId)) {
      res.status(400);
      throw new Error("Invalid student id");
    }
    if (!(await canViewStudent(req.user, studentId))) {
      res.status(403);
      throw new Error("You do not have access to this student");
    }

    const match = { "records.student": new mongoose.Types.ObjectId(studentId) };
    if (req.query.term && isValidId(req.query.term)) {
      match.term = new mongoose.Types.ObjectId(req.query.term);
    }

    const rows = await Attendance.find(match).select("records date");
    const counts = { Present: 0, Absent: 0, Late: 0, Excused: 0 };
    for (const row of rows) {
      const rec = row.records.find((r) => String(r.student) === String(studentId));
      if (rec) counts[rec.status] += 1;
    }
    const total = counts.Present + counts.Absent + counts.Late + counts.Excused;
    const present = counts.Present + counts.Late; // late still counts as attended
    const rate = total ? Math.round((present / total) * 1000) / 10 : null;

    res.json({ studentId, counts, totalDays: total, attendanceRate: rate });
  } catch (err) {
    next(err);
  }
}

// PUT /api/attendance/:id   body: { records, note }
export async function updateAttendance(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid attendance id");
    }
    const row = await Attendance.findById(req.params.id);
    if (!row) {
      res.status(404);
      throw new Error("Attendance record not found");
    }
    if (!(await canMarkClass(req.user, row.schoolClass))) {
      res.status(403);
      throw new Error("You cannot change attendance for this class");
    }

    const roster = await User.find({
      role: "Student",
      schoolClass: row.schoolClass,
      enrollmentStatus: "Enrolled",
    }).select("name guardians admissionNo");
    const rosterIds = new Set(roster.map((s) => String(s._id)));

    if (req.body.records !== undefined) {
      if (!Array.isArray(req.body.records)) {
        res.status(400);
        throw new Error("records must be an array");
      }
      const previousAbsent = new Set(
        row.records.filter((r) => r.status === "Absent").map((r) => String(r.student))
      );
      const clean = [];
      for (const r of req.body.records) {
        if (!rosterIds.has(String(r.student)) || !STATUSES.includes(r.status)) {
          res.status(400);
          throw new Error("Invalid record in the list");
        }
        clean.push({ student: r.student, status: r.status });
      }
      row.records = clean;
      row.markedBy = req.user._id;

      const newlyAbsent = clean
        .filter((r) => r.status === "Absent" && !previousAbsent.has(String(r.student)))
        .map((r) => String(r.student));
      const dateLabel = row.date.toISOString().slice(0, 10);
      for (const student of roster) {
        if (!newlyAbsent.includes(String(student._id))) continue;
        await notifyGuardians(student, {
          content: `${student.name} was marked absent on ${dateLabel}.`,
          relatedTo: "attendance",
          relatedId: row._id,
          meta: { date: dateLabel },
        });
      }
    }
    if (req.body.note !== undefined) row.note = req.body.note;

    await row.save();
    res.json({
      attendance: await Attendance.findById(row._id).populate("records.student", "name admissionNo"),
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/attendance/:id  (admin)
export async function deleteAttendance(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid attendance id");
    }
    const row = await Attendance.findById(req.params.id);
    if (!row) {
      res.status(404);
      throw new Error("Attendance record not found");
    }
    await row.deleteOne();
    res.json({ message: "Attendance record deleted" });
  } catch (err) {
    next(err);
  }
}

// admin and teachers see any student. a parent sees only their own children,
// a student sees only themselves.
async function canViewStudent(user, studentId) {
  if (user.role === "Admin" || user.role === "Teacher") return true;
  if (user.role === "Student") return user._id.equals(studentId);
  if (user.role === "Parent") {
    const child = await User.exists({ _id: studentId, role: "Student", "guardians.user": user._id });
    return Boolean(child);
  }
  return false;
}
