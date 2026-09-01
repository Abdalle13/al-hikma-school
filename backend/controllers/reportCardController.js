import mongoose from "mongoose";
import Exam from "../models/examModel.js";
import Mark from "../models/markModel.js";
import ReportCard from "../models/reportCardModel.js";
import SchoolClass from "../models/schoolClassModel.js";
import Term from "../models/termModel.js";
import User from "../models/userModel.js";
import { gradeForPercentage, divisionForAverage, round1 } from "../utils/grading.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// builds (or rebuilds) the report cards for every enrolled student in a class
// for one term. keeps any existing published flag and teacher remark.
async function computeForClassTerm(schoolClassId, termId) {
  const students = await User.find({
    role: "Student",
    schoolClass: schoolClassId,
    enrollmentStatus: "Enrolled",
  }).select("name admissionNo");

  const exams = await Exam.find({ schoolClass: schoolClassId, term: termId }).populate(
    "subject",
    "name code"
  );
  const examById = Object.fromEntries(exams.map((e) => [String(e._id), e]));
  const marks = await Mark.find({ exam: { $in: exams.map((e) => e._id) } });

  // student -> subject -> { score, max, exams: [] }
  const perStudent = new Map();
  for (const s of students) perStudent.set(String(s._id), new Map());

  for (const m of marks) {
    const exam = examById[String(m.exam)];
    if (!exam) continue;
    const bucket = perStudent.get(String(m.student));
    if (!bucket) continue; // not an enrolled student any more
    const key = String(exam.subject._id);
    const line = bucket.get(key) || {
      subject: exam.subject._id,
      subjectName: exam.subject.name,
      subjectCode: exam.subject.code,
      score: 0,
      max: 0,
      exams: [],
    };
    line.score += m.score;
    line.max += exam.maxMarks;
    line.exams.push({ title: exam.title, type: exam.type, score: m.score, max: exam.maxMarks });
    bucket.set(key, line);
  }

  // build the numbers per student
  const drafts = students.map((s) => {
    const bucket = perStudent.get(String(s._id));
    const subjects = [...bucket.values()].map((line) => {
      const percentage = line.max ? round1((line.score / line.max) * 100) : 0;
      return { ...line, percentage, grade: gradeForPercentage(percentage) };
    });
    const average = subjects.length
      ? round1(subjects.reduce((a, x) => a + x.percentage, 0) / subjects.length)
      : 0;
    return {
      student: s._id,
      subjects,
      average,
      overallGrade: gradeForPercentage(average),
      division: divisionForAverage(average),
    };
  });

  // class positions by average, highest first, ties share a position
  const sorted = [...drafts].sort((a, b) => b.average - a.average);
  let lastAvg = null;
  let lastPos = 0;
  sorted.forEach((d, i) => {
    if (d.average !== lastAvg) {
      lastPos = i + 1;
      lastAvg = d.average;
    }
    d.position = lastPos;
  });
  const totalStudents = drafts.length;

  // upsert each report card, keeping published + remark
  const results = [];
  for (const d of drafts) {
    const existing = await ReportCard.findOne({ student: d.student, term: termId });
    const doc =
      existing ||
      new ReportCard({ student: d.student, term: termId, schoolClass: schoolClassId });
    doc.schoolClass = schoolClassId;
    doc.subjects = d.subjects;
    doc.average = d.average;
    doc.overallGrade = d.overallGrade;
    doc.division = d.division;
    doc.position = d.position;
    doc.totalStudents = totalStudents;
    doc.generatedAt = new Date();
    await doc.save();
    results.push(doc);
  }
  return results;
}

// POST /api/report-cards/generate   (admin)   body: { term, schoolClass }
export async function generateReportCards(req, res, next) {
  try {
    const { term, schoolClass } = req.body;
    if (!isValidId(term || "") || !isValidId(schoolClass || "")) {
      res.status(400);
      throw new Error("Valid term and schoolClass are required");
    }
    const [trm, cls] = await Promise.all([Term.findById(term), SchoolClass.findById(schoolClass)]);
    if (!trm) throw Object.assign(new Error("Term not found"), { status: 404 });
    if (!cls) throw Object.assign(new Error("Class not found"), { status: 404 });

    const results = await computeForClassTerm(schoolClass, term);
    res.json({
      message: `Generated ${results.length} report card(s)`,
      count: results.length,
    });
  } catch (err) {
    if (err.status) res.status(err.status);
    next(err);
  }
}

const populateCard = (q) =>
  q
    .populate("student", "name admissionNo gender")
    .populate("term", "name academicYear")
    .populate("schoolClass", "name section academicYear");

// GET /api/report-cards   (staff)   ?term=&schoolClass=&published=
export async function listReportCards(req, res, next) {
  try {
    const filter = {};
    if (req.query.term && isValidId(req.query.term)) filter.term = req.query.term;
    if (req.query.schoolClass && isValidId(req.query.schoolClass)) filter.schoolClass = req.query.schoolClass;
    if (req.query.published === "true") filter.published = true;
    if (req.query.published === "false") filter.published = false;

    const cards = await populateCard(ReportCard.find(filter).sort({ position: 1 }));
    res.json({ reportCards: cards, total: cards.length });
  } catch (err) {
    next(err);
  }
}

async function loadCardScoped(req, res) {
  const card = await populateCard(ReportCard.findById(req.params.id));
  if (!card) {
    res.status(404);
    throw new Error("Report card not found");
  }
  const u = req.user;
  if (u.role === "Admin" || u.role === "Teacher") return card;
  if (!card.published) {
    res.status(403);
    throw new Error("This report card is not published yet");
  }
  if (u.role === "Student" && u._id.equals(card.student._id)) return card;
  if (u.role === "Parent") {
    const ok = await User.exists({
      _id: card.student._id,
      role: "Student",
      "guardians.user": u._id,
    });
    if (ok) return card;
  }
  res.status(403);
  throw new Error("You do not have access to this report card");
}

// GET /api/report-cards/:id
export async function getReportCard(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid report card id");
    }
    const card = await loadCardScoped(req, res);
    res.json({ reportCard: card });
  } catch (err) {
    next(err);
  }
}

// GET /api/report-cards/student/:studentId?term=
export async function getStudentReportCard(req, res, next) {
  try {
    const { studentId } = req.params;
    if (!isValidId(studentId)) {
      res.status(400);
      throw new Error("Invalid student id");
    }
    const u = req.user;
    if (u.role === "Student" && !u._id.equals(studentId)) {
      res.status(403);
      throw new Error("You can only see your own report card");
    }
    if (u.role === "Parent") {
      const ok = await User.exists({ _id: studentId, role: "Student", "guardians.user": u._id });
      if (!ok) {
        res.status(403);
        throw new Error("Not your child");
      }
    }

    const filter = { student: studentId };
    if (req.query.term && isValidId(req.query.term)) filter.term = req.query.term;
    const cards = await populateCard(ReportCard.find(filter).sort({ createdAt: -1 }));

    const visible =
      u.role === "Admin" || u.role === "Teacher" ? cards : cards.filter((c) => c.published);
    res.json({ reportCards: visible, total: visible.length });
  } catch (err) {
    next(err);
  }
}

// PUT /api/report-cards/:id   (admin or the class teacher)   body: { remark }
export async function updateReportCard(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid report card id");
    }
    const card = await ReportCard.findById(req.params.id);
    if (!card) {
      res.status(404);
      throw new Error("Report card not found");
    }
    if (req.user.role !== "Admin") {
      const cls = await SchoolClass.findById(card.schoolClass).select("classTeacher");
      if (!cls?.classTeacher?.equals(req.user._id)) {
        res.status(403);
        throw new Error("Only an admin or the class teacher can edit this");
      }
    }
    if (req.body.remark !== undefined) card.remark = req.body.remark;
    await card.save();
    res.json({ reportCard: await populateCard(ReportCard.findById(card._id)) });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/report-cards/:id/publish  and  /unpublish   (admin)
export function setPublished(publish) {
  return async (req, res, next) => {
    try {
      if (!isValidId(req.params.id)) {
        res.status(400);
        throw new Error("Invalid report card id");
      }
      const card = await ReportCard.findByIdAndUpdate(
        req.params.id,
        { published: publish },
        { returnDocument: "after" }
      );
      if (!card) {
        res.status(404);
        throw new Error("Report card not found");
      }
      res.json({ reportCard: card });
    } catch (err) {
      next(err);
    }
  };
}

// PATCH /api/report-cards/publish   (admin)   body: { term, schoolClass, published }
export async function bulkPublish(req, res, next) {
  try {
    const { term, schoolClass } = req.body;
    const published = req.body.published !== false;
    if (!isValidId(term || "") || !isValidId(schoolClass || "")) {
      res.status(400);
      throw new Error("Valid term and schoolClass are required");
    }
    const result = await ReportCard.updateMany({ term, schoolClass }, { $set: { published } });
    res.json({ updated: result.modifiedCount, published });
  } catch (err) {
    next(err);
  }
}

// GET /api/report-cards/:id/pdf
export async function reportCardPdf(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid report card id");
    }
    const card = await loadCardScoped(req, res);

    // lazy load the pdf libraries, they are heavy and rarely used
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    const green = [21, 128, 61];

    doc.setFontSize(18);
    doc.setTextColor(...green);
    doc.text("Report Card", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(40);
    const cls = card.schoolClass ? `${card.schoolClass.name} ${card.schoolClass.section || ""}`.trim() : "";
    doc.text(`Student: ${card.student.name}`, 14, 30);
    doc.text(`Admission No: ${card.student.admissionNo || "-"}`, 14, 36);
    doc.text(`Class: ${cls}`, 14, 42);
    doc.text(`Term: ${card.term.name} (${card.term.academicYear})`, 14, 48);

    autoTable(doc, {
      startY: 56,
      head: [["Subject", "Score", "Max", "%", "Grade"]],
      body: card.subjects.map((s) => [
        s.subjectName,
        String(s.score),
        String(s.max),
        `${s.percentage}%`,
        s.grade,
      ]),
      headStyles: { fillColor: green },
      styles: { fontSize: 10 },
    });

    const afterTable = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.text(`Average: ${card.average}%`, 14, afterTable);
    doc.text(`Overall grade: ${card.overallGrade}`, 14, afterTable + 6);
    doc.text(`Division: ${card.division}`, 14, afterTable + 12);
    doc.text(`Position: ${card.position} of ${card.totalStudents}`, 14, afterTable + 18);
    if (card.remark) {
      doc.text(`Teacher remark: ${card.remark}`, 14, afterTable + 26);
    }
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      `Generated ${new Date(card.generatedAt || Date.now()).toISOString().slice(0, 10)}${
        card.published ? "" : " (draft, not published)"
      }`,
      14,
      afterTable + 36
    );

    const buffer = Buffer.from(doc.output("arraybuffer"));
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="report-card-${card.student.admissionNo || card.student._id}.pdf"`
    );
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}
