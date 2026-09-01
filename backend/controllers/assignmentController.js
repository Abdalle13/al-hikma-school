import mongoose from "mongoose";
import TeachingAssignment from "../models/teachingAssignmentModel.js";
import SchoolClass from "../models/schoolClassModel.js";
import Subject from "../models/subjectModel.js";
import User from "../models/userModel.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const populated = (q) =>
  q
    .populate("teacher", "name email phone status")
    .populate("schoolClass", "name section academicYear")
    .populate("subject", "name code");

// POST /api/assignments  (admin)
// body: { teacher, schoolClass, subject }
export async function createAssignment(req, res, next) {
  try {
    const { teacher, schoolClass, subject } = req.body;
    if (![teacher, schoolClass, subject].every((v) => isValidId(v || ""))) {
      res.status(400);
      throw new Error("teacher, schoolClass and subject ids are required");
    }

    const [teacherDoc, classDoc, subjectDoc] = await Promise.all([
      User.findById(teacher),
      SchoolClass.findById(schoolClass),
      Subject.findById(subject),
    ]);

    if (!teacherDoc || teacherDoc.role !== "Teacher") {
      res.status(400);
      throw new Error("That teacher does not exist");
    }
    if (teacherDoc.status !== "Active") {
      res.status(400);
      throw new Error("That teacher account is inactive");
    }
    if (!classDoc) {
      res.status(400);
      throw new Error("That class does not exist");
    }
    if (!subjectDoc) {
      res.status(400);
      throw new Error("That subject does not exist");
    }
    if (!classDoc.subjects.some((s) => s.equals(subjectDoc._id))) {
      res.status(400);
      throw new Error("That subject is not on that class. Add it to the class first.");
    }

    if (await TeachingAssignment.findOne({ teacher, schoolClass, subject })) {
      res.status(409);
      throw new Error("That teacher already teaches that subject in that class");
    }

    const created = await TeachingAssignment.create({
      teacher,
      schoolClass,
      subject,
      academicYear: classDoc.academicYear,
    });

    res.status(201).json({ assignment: await populated(TeachingAssignment.findById(created._id)) });
  } catch (err) {
    if (err.code === 11000) {
      res.status(409);
      return next(new Error("That teacher already teaches that subject in that class"));
    }
    next(err);
  }
}

// GET /api/assignments  (admin sees all, a teacher sees only their own)
// filters: teacher, schoolClass, subject, academicYear
export async function listAssignments(req, res, next) {
  try {
    const filter = {};

    if (req.user.role === "Teacher") {
      filter.teacher = req.user._id;
    } else if (req.query.teacher && isValidId(req.query.teacher)) {
      filter.teacher = req.query.teacher;
    }

    if (req.query.schoolClass && isValidId(req.query.schoolClass)) filter.schoolClass = req.query.schoolClass;
    if (req.query.subject && isValidId(req.query.subject)) filter.subject = req.query.subject;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;

    const assignments = await populated(TeachingAssignment.find(filter).sort({ createdAt: -1 }));
    res.json({ assignments, total: assignments.length });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/assignments/:id  (admin)
export async function deleteAssignment(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid assignment id");
    }
    const assignment = await TeachingAssignment.findById(req.params.id);
    if (!assignment) {
      res.status(404);
      throw new Error("Assignment not found");
    }
    await assignment.deleteOne();
    res.json({ message: "Assignment removed" });
  } catch (err) {
    next(err);
  }
}

// GET /api/staff  (admin)
// the teacher roster with a count of what each one teaches
export async function listStaff(req, res, next) {
  try {
    const { status, search } = req.query;
    const filter = { role: "Teacher" };
    if (status) filter.status = status;
    if (search) {
      const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
    }

    const teachers = await User.find(filter).sort({ name: 1 });

    const counts = await TeachingAssignment.aggregate([
      { $group: { _id: "$teacher", assignments: { $sum: 1 } } },
    ]);
    const byId = Object.fromEntries(counts.map((c) => [String(c._id), c.assignments]));

    const classTeacherOf = await SchoolClass.find({
      classTeacher: { $in: teachers.map((t) => t._id) },
    }).select("name section academicYear classTeacher");

    res.json({
      staff: teachers.map((t) => ({
        ...t.toSafeJSON(),
        assignmentCount: byId[String(t._id)] || 0,
        classTeacherOf: classTeacherOf
          .filter((c) => c.classTeacher.equals(t._id))
          .map((c) => ({ _id: c._id, name: c.name, section: c.section, academicYear: c.academicYear })),
      })),
      total: teachers.length,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/staff/:id  (admin, or the teacher themselves)
export async function getStaff(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid teacher id");
    }
    if (req.user.role === "Teacher" && !req.user._id.equals(req.params.id)) {
      res.status(403);
      throw new Error("You do not have access to this resource");
    }

    const teacher = await User.findOne({ _id: req.params.id, role: "Teacher" });
    if (!teacher) {
      res.status(404);
      throw new Error("Teacher not found");
    }

    const [assignments, classTeacherOf] = await Promise.all([
      populated(TeachingAssignment.find({ teacher: teacher._id })),
      SchoolClass.find({ classTeacher: teacher._id }).select("name section academicYear"),
    ]);

    res.json({ teacher: teacher.toSafeJSON(), assignments, classTeacherOf });
  } catch (err) {
    next(err);
  }
}
