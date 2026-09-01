import mongoose from "mongoose";
import Exam from "../models/examModel.js";
import Mark from "../models/markModel.js";
import SchoolClass from "../models/schoolClassModel.js";
import Subject from "../models/subjectModel.js";
import Term from "../models/termModel.js";
import User from "../models/userModel.js";
import TeachingAssignment from "../models/teachingAssignmentModel.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// admin, or a teacher assigned to teach this subject in this class
async function canManageExam(user, schoolClassId, subjectId) {
  if (user.role === "Admin") return true;
  if (user.role !== "Teacher") return false;
  const assigned = await TeachingAssignment.exists({
    teacher: user._id,
    schoolClass: schoolClassId,
    subject: subjectId,
  });
  return Boolean(assigned);
}

// POST /api/exams
export async function createExam(req, res, next) {
  try {
    const { title, type, schoolClass, subject, term, maxMarks, date } = req.body;
    if (!title || !type || !schoolClass || !subject || !term || maxMarks === undefined) {
      res.status(400);
      throw new Error("title, type, schoolClass, subject, term and maxMarks are required");
    }
    if (!["Quiz", "Midterm", "Final"].includes(type)) {
      res.status(400);
      throw new Error("type must be Quiz, Midterm or Final");
    }
    if (!(Number(maxMarks) > 0)) {
      res.status(400);
      throw new Error("maxMarks must be greater than 0");
    }
    if (![schoolClass, subject, term].every((v) => isValidId(v))) {
      res.status(400);
      throw new Error("Invalid schoolClass, subject or term id");
    }

    const [cls, sub, trm] = await Promise.all([
      SchoolClass.findById(schoolClass),
      Subject.findById(subject),
      Term.findById(term),
    ]);
    if (!cls) throw Object.assign(new Error("Class not found"), { status: 404 });
    if (!sub) throw Object.assign(new Error("Subject not found"), { status: 404 });
    if (!trm) throw Object.assign(new Error("Term not found"), { status: 404 });
    if (!cls.subjects.some((s) => s.equals(sub._id))) {
      res.status(400);
      throw new Error("That subject is not on that class");
    }

    if (!(await canManageExam(req.user, schoolClass, subject))) {
      res.status(403);
      throw new Error("You do not teach this subject in this class");
    }

    const exam = await Exam.create({
      title,
      type,
      schoolClass,
      subject,
      term,
      maxMarks,
      date,
      createdBy: req.user._id,
    });

    res.status(201).json({ exam: await populateExam(Exam.findById(exam._id)) });
  } catch (err) {
    if (err.status) res.status(err.status);
    next(err);
  }
}

const populateExam = (q) =>
  q
    .populate("schoolClass", "name section academicYear")
    .populate("subject", "name code")
    .populate("term", "name academicYear")
    .populate("createdBy", "name role");

// GET /api/exams   filters: schoolClass, subject, term, type
export async function listExams(req, res, next) {
  try {
    const filter = {};
    for (const k of ["schoolClass", "subject", "term"]) {
      if (req.query[k] && isValidId(req.query[k])) filter[k] = req.query[k];
    }
    if (req.query.type) filter.type = req.query.type;

    const exams = await populateExam(Exam.find(filter).sort({ date: -1, createdAt: -1 }));

    // attach how many marks are in vs the class roster size
    const withCounts = await Promise.all(
      exams.map(async (e) => {
        const [entered, roster] = await Promise.all([
          Mark.countDocuments({ exam: e._id }),
          User.countDocuments({
            role: "Student",
            schoolClass: e.schoolClass?._id || e.schoolClass,
            enrollmentStatus: "Enrolled",
          }),
        ]);
        return { ...e.toJSON(), marksEntered: entered, rosterSize: roster };
      })
    );

    res.json({ exams: withCounts, total: withCounts.length });
  } catch (err) {
    next(err);
  }
}

// GET /api/exams/:id
export async function getExam(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid exam id");
    }
    const exam = await populateExam(Exam.findById(req.params.id));
    if (!exam) {
      res.status(404);
      throw new Error("Exam not found");
    }
    res.json({ exam });
  } catch (err) {
    next(err);
  }
}

// PUT /api/exams/:id
export async function updateExam(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid exam id");
    }
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      res.status(404);
      throw new Error("Exam not found");
    }
    if (!(await canManageExam(req.user, exam.schoolClass, exam.subject))) {
      res.status(403);
      throw new Error("You do not manage this exam");
    }

    const { title, type, maxMarks, date } = req.body;
    if (title !== undefined) exam.title = title;
    if (type !== undefined) {
      if (!["Quiz", "Midterm", "Final"].includes(type)) {
        res.status(400);
        throw new Error("type must be Quiz, Midterm or Final");
      }
      exam.type = type;
    }
    if (date !== undefined) exam.date = date;
    if (maxMarks !== undefined) {
      if (!(Number(maxMarks) > 0)) {
        res.status(400);
        throw new Error("maxMarks must be greater than 0");
      }
      const overMax = await Mark.findOne({ exam: exam._id, score: { $gt: Number(maxMarks) } });
      if (overMax) {
        res.status(409);
        throw new Error("Some entered marks are above the new maximum. Fix those first.");
      }
      exam.maxMarks = maxMarks;
    }

    await exam.save();
    res.json({ exam: await populateExam(Exam.findById(exam._id)) });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/exams/:id   (admin)
export async function deleteExam(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid exam id");
    }
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      res.status(404);
      throw new Error("Exam not found");
    }
    const marks = await Mark.countDocuments({ exam: exam._id });
    if (marks > 0) {
      res.status(409);
      throw new Error(`This exam has ${marks} mark(s). Clear them before deleting it.`);
    }
    await exam.deleteOne();
    res.json({ message: "Exam deleted" });
  } catch (err) {
    next(err);
  }
}

// PUT /api/exams/:id/marks
// body: { marks: [{ student, score, remark }] }
export async function enterMarks(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid exam id");
    }
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      res.status(404);
      throw new Error("Exam not found");
    }
    if (!(await canManageExam(req.user, exam.schoolClass, exam.subject))) {
      res.status(403);
      throw new Error("You do not manage this exam");
    }

    const { marks } = req.body;
    if (!Array.isArray(marks) || marks.length === 0) {
      res.status(400);
      throw new Error("marks must be a non empty array");
    }

    const roster = await User.find({
      role: "Student",
      schoolClass: exam.schoolClass,
      enrollmentStatus: "Enrolled",
    }).select("_id");
    const rosterIds = new Set(roster.map((s) => String(s._id)));

    const ops = [];
    for (const m of marks) {
      if (!isValidId(m.student || "") || !rosterIds.has(String(m.student))) {
        res.status(400);
        throw new Error("Every mark must be for an enrolled student of this class");
      }
      const score = Number(m.score);
      if (Number.isNaN(score) || score < 0 || score > exam.maxMarks) {
        res.status(400);
        throw new Error(`Every score must be between 0 and ${exam.maxMarks}`);
      }
      ops.push({
        updateOne: {
          filter: { exam: exam._id, student: m.student },
          update: {
            $set: { score, remark: m.remark, enteredBy: req.user._id },
            $setOnInsert: { exam: exam._id, student: m.student },
          },
          upsert: true,
        },
      });
    }

    await Mark.bulkWrite(ops);
    const saved = await Mark.find({ exam: exam._id }).populate("student", "name admissionNo");
    res.json({ marks: saved, total: saved.length });
  } catch (err) {
    next(err);
  }
}

// GET /api/exams/:id/marks
export async function listMarks(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid exam id");
    }
    const exam = await populateExam(Exam.findById(req.params.id));
    if (!exam) {
      res.status(404);
      throw new Error("Exam not found");
    }
    const marks = await Mark.find({ exam: exam._id }).populate("student", "name admissionNo");
    res.json({ exam, marks, total: marks.length });
  } catch (err) {
    next(err);
  }
}

// GET /api/marks?student=&term=   a student's marks across exams
export async function studentMarks(req, res, next) {
  try {
    const { student, term } = req.query;
    if (!isValidId(student || "")) {
      res.status(400);
      throw new Error("A valid student query is required");
    }

    // scope: parent sees own child, student sees self, staff sees anyone
    if (req.user.role === "Student" && !req.user._id.equals(student)) {
      res.status(403);
      throw new Error("You can only see your own marks");
    }
    if (req.user.role === "Parent") {
      const ok = await User.exists({ _id: student, role: "Student", "guardians.user": req.user._id });
      if (!ok) {
        res.status(403);
        throw new Error("Not your child");
      }
    }

    const examFilter = {};
    if (term && isValidId(term)) examFilter.term = term;
    const exams = await Exam.find(examFilter).select("_id");
    const examIds = exams.map((e) => e._id);

    const marks = await Mark.find({ student, exam: { $in: examIds } }).populate({
      path: "exam",
      select: "title type maxMarks date subject term",
      populate: [
        { path: "subject", select: "name code" },
        { path: "term", select: "name academicYear" },
      ],
    });

    res.json({ marks, total: marks.length });
  } catch (err) {
    next(err);
  }
}
