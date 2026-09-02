import mongoose from "mongoose";
import User from "../models/userModel.js";
import SchoolClass from "../models/schoolClassModel.js";
import Attendance from "../models/attendanceModel.js";
import Invoice from "../models/invoiceModel.js";
import Mark from "../models/markModel.js";
import Exam from "../models/examModel.js";
import Term from "../models/termModel.js";
import { gradeForPercentage } from "../utils/grading.js";

const oid = (v) => new mongoose.Types.ObjectId(v);
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ---- compute functions (return data, no res) ----

async function computeEnrolment() {
  const [classes, byClass, genderRows, unassigned, totalStudents, totalEnrolled] = await Promise.all([
    SchoolClass.find().select("name section academicYear capacity").sort({ name: 1 }),
    User.aggregate([
      { $match: { role: "Student" } },
      { $group: { _id: { schoolClass: "$schoolClass", status: "$enrollmentStatus" }, n: { $sum: 1 } } },
    ]),
    User.aggregate([
      { $match: { role: "Student", enrollmentStatus: "Enrolled" } },
      { $group: { _id: "$gender", n: { $sum: 1 } } },
    ]),
    User.countDocuments({ role: "Student", enrollmentStatus: "Enrolled", schoolClass: { $in: [null, undefined] } }),
    User.countDocuments({ role: "Student" }),
    User.countDocuments({ role: "Student", enrollmentStatus: "Enrolled" }),
  ]);

  const map = {};
  for (const row of byClass) {
    const key = String(row._id.schoolClass);
    map[key] = map[key] || { Enrolled: 0, Graduated: 0, Withdrawn: 0 };
    map[key][row._id.status || "Enrolled"] = row.n;
  }
  const gender = { Male: 0, Female: 0, Unknown: 0 };
  for (const g of genderRows) gender[g._id || "Unknown"] = g.n;

  const perClass = classes.map((c) => ({
    _id: c._id,
    name: c.name,
    section: c.section,
    academicYear: c.academicYear,
    capacity: c.capacity,
    enrolled: map[String(c._id)]?.Enrolled || 0,
    graduated: map[String(c._id)]?.Graduated || 0,
    withdrawn: map[String(c._id)]?.Withdrawn || 0,
  }));

  return { totalStudents, totalEnrolled, unassigned, gender, perClass };
}

async function computeFees(query = {}) {
  const match = {};
  if (query.term && isValidId(query.term)) match.term = oid(query.term);

  const [totals, byStatus, perClass, overdue] = await Promise.all([
    Invoice.aggregate([
      { $match: match },
      { $group: { _id: null, billed: { $sum: "$total" }, paid: { $sum: "$amountPaid" }, outstanding: { $sum: "$balance" }, invoices: { $sum: 1 } } },
    ]),
    Invoice.aggregate([
      { $match: match },
      { $group: { _id: "$status", n: { $sum: 1 }, outstanding: { $sum: "$balance" } } },
    ]),
    Invoice.aggregate([
      { $match: match },
      { $group: { _id: "$schoolClass", billed: { $sum: "$total" }, paid: { $sum: "$amountPaid" }, outstanding: { $sum: "$balance" } } },
      { $lookup: { from: "schoolclasses", localField: "_id", foreignField: "_id", as: "cls" } },
      { $unwind: { path: "$cls", preserveNullAndEmptyArrays: true } },
      { $project: { className: { $ifNull: ["$cls.name", "Unassigned"] }, section: "$cls.section", billed: 1, paid: 1, outstanding: 1 } },
      { $sort: { className: 1 } },
    ]),
    Invoice.countDocuments({ ...match, balance: { $gt: 0 }, dueDate: { $lt: new Date() } }),
  ]);

  const t = totals[0] || { billed: 0, paid: 0, outstanding: 0, invoices: 0 };
  return {
    billed: t.billed,
    paid: t.paid,
    outstanding: t.outstanding,
    invoices: t.invoices,
    collectionRate: t.billed ? Math.round((t.paid / t.billed) * 1000) / 10 : null,
    overdueCount: overdue,
    byStatus: Object.fromEntries(byStatus.map((s) => [s._id, { count: s.n, outstanding: s.outstanding }])),
    perClass,
  };
}

async function computeAttendance(query = {}) {
  const match = {};
  if (query.term && isValidId(query.term)) match.term = oid(query.term);
  if (query.from || query.to) {
    match.date = {};
    if (query.from) match.date.$gte = new Date(query.from);
    if (query.to) match.date.$lte = new Date(query.to);
  }

  const rows = await Attendance.aggregate([
    { $match: match },
    { $unwind: "$records" },
    { $group: { _id: { schoolClass: "$schoolClass", status: "$records.status" }, n: { $sum: 1 } } },
  ]);

  const perClassMap = {};
  let totalPresent = 0;
  let totalAll = 0;
  for (const r of rows) {
    const key = String(r._id.schoolClass);
    perClassMap[key] = perClassMap[key] || { Present: 0, Absent: 0, Late: 0, Excused: 0 };
    perClassMap[key][r._id.status] += r.n;
    totalAll += r.n;
    if (r._id.status === "Present" || r._id.status === "Late") totalPresent += r.n;
  }

  const classes = await SchoolClass.find({ _id: { $in: Object.keys(perClassMap).map(oid) } }).select("name section");
  const nameById = Object.fromEntries(classes.map((c) => [String(c._id), `${c.name} ${c.section || ""}`.trim()]));

  const perClass = Object.entries(perClassMap).map(([id, c]) => {
    const total = c.Present + c.Absent + c.Late + c.Excused;
    const attended = c.Present + c.Late;
    return { schoolClass: id, className: nameById[id] || "Unknown", ...c, total, rate: total ? Math.round((attended / total) * 1000) / 10 : null };
  });

  return {
    overallRate: totalAll ? Math.round((totalPresent / totalAll) * 1000) / 10 : null,
    totalRecords: totalAll,
    perClass,
  };
}

async function computeExams(query = {}) {
  const examMatch = {};
  if (query.term && isValidId(query.term)) examMatch.term = oid(query.term);
  if (query.schoolClass && isValidId(query.schoolClass)) examMatch.schoolClass = oid(query.schoolClass);

  const exams = await Exam.find(examMatch).select("_id maxMarks subject schoolClass").lean();
  if (!exams.length) return { perSubject: [], overall: null, gradeDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 }, marksCounted: 0, passRate: null };

  const examById = Object.fromEntries(exams.map((e) => [String(e._id), e]));
  const marks = await Mark.find({ exam: { $in: exams.map((e) => e._id) } }).select("exam score").lean();

  const subjectAgg = {};
  let sumPct = 0;
  let countPct = 0;
  const gradeDistribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };

  for (const m of marks) {
    const exam = examById[String(m.exam)];
    if (!exam || !exam.maxMarks) continue;
    const pct = (m.score / exam.maxMarks) * 100;
    const key = String(exam.subject);
    subjectAgg[key] = subjectAgg[key] || { sum: 0, n: 0 };
    subjectAgg[key].sum += pct;
    subjectAgg[key].n += 1;
    sumPct += pct;
    countPct += 1;
    gradeDistribution[gradeForPercentage(pct)] += 1;
  }

  const subjectIds = Object.keys(subjectAgg).map(oid);
  const subjects = await mongoose.model("Subject").find({ _id: { $in: subjectIds } }).select("name code").lean();
  const subjById = Object.fromEntries(subjects.map((s) => [String(s._id), s]));

  const perSubject = Object.entries(subjectAgg)
    .map(([id, a]) => ({
      subject: id,
      name: subjById[id]?.name || "Unknown",
      code: subjById[id]?.code,
      averagePercentage: Math.round((a.sum / a.n) * 10) / 10,
      marksCounted: a.n,
    }))
    .sort((x, y) => y.averagePercentage - x.averagePercentage);

  return {
    overall: countPct ? Math.round((sumPct / countPct) * 10) / 10 : null,
    marksCounted: countPct,
    passRate: countPct ? Math.round(((countPct - gradeDistribution.F) / countPct) * 1000) / 10 : null,
    gradeDistribution,
    perSubject,
  };
}

async function computeOverview() {
  const [students, teachers, parents, classes, activeTerm] = await Promise.all([
    User.countDocuments({ role: "Student", enrollmentStatus: "Enrolled" }),
    User.countDocuments({ role: "Teacher", status: "Active" }),
    User.countDocuments({ role: "Parent" }),
    SchoolClass.countDocuments(),
    Term.findOne({ isActive: true }).select("name academicYear"),
  ]);

  const feeAgg = await Invoice.aggregate([
    ...(activeTerm ? [{ $match: { term: activeTerm._id } }] : []),
    { $group: { _id: null, billed: { $sum: "$total" }, paid: { $sum: "$amountPaid" } } },
  ]);
  const fee = feeAgg[0] || { billed: 0, paid: 0 };

  return {
    students,
    teachers,
    parents,
    classes,
    activeTerm: activeTerm || null,
    feeCollectionRate: fee.billed ? Math.round((fee.paid / fee.billed) * 1000) / 10 : null,
    outstanding: Math.round((fee.billed - fee.paid) * 100) / 100,
  };
}

// ---- route handlers ----

export async function enrolmentReport(req, res, next) {
  try {
    res.json(await computeEnrolment());
  } catch (err) {
    next(err);
  }
}

export async function feesReport(req, res, next) {
  try {
    res.json(await computeFees(req.query));
  } catch (err) {
    next(err);
  }
}

export async function attendanceReport(req, res, next) {
  try {
    res.json(await computeAttendance(req.query));
  } catch (err) {
    next(err);
  }
}

export async function examsReport(req, res, next) {
  try {
    res.json(await computeExams(req.query));
  } catch (err) {
    next(err);
  }
}

export async function overviewReport(req, res, next) {
  try {
    res.json(await computeOverview());
  } catch (err) {
    next(err);
  }
}

// GET /api/reports/dashboard  -  everything the reports screen needs in one call
export async function dashboardReport(req, res, next) {
  try {
    const isAdmin = req.user.role === "Admin";
    const [overview, enrolment, attendance, exams, fees] = await Promise.all([
      computeOverview(),
      computeEnrolment(),
      computeAttendance(req.query),
      computeExams(req.query),
      isAdmin ? computeFees(req.query) : Promise.resolve(null),
    ]);
    res.json({ overview, enrolment, attendance, exams, fees });
  } catch (err) {
    next(err);
  }
}
