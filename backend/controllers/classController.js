import mongoose from "mongoose";
import SchoolClass from "../models/schoolClassModel.js";
import Subject from "../models/subjectModel.js";
import User from "../models/userModel.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const populated = (q) =>
  q
    .populate("classTeacher", "name email phone role status")
    .populate("subjects", "name code gradeLevel");

// validates that every id in the list is an existing subject
async function checkSubjects(ids) {
  if (!ids) return undefined;
  if (!Array.isArray(ids)) throw Object.assign(new Error("subjects must be an array"), { status: 400 });
  const clean = [...new Set(ids.map(String))];
  for (const id of clean) {
    if (!isValidId(id)) throw Object.assign(new Error(`Invalid subject id ${id}`), { status: 400 });
  }
  const found = await Subject.countDocuments({ _id: { $in: clean } });
  if (found !== clean.length) throw Object.assign(new Error("One or more subjects do not exist"), { status: 400 });
  return clean;
}

// validates that the id is an active teacher
async function checkTeacher(id) {
  if (id === undefined) return undefined;
  if (id === null || id === "") return null;
  if (!isValidId(id)) throw Object.assign(new Error("Invalid class teacher id"), { status: 400 });
  const teacher = await User.findById(id);
  if (!teacher || teacher.role !== "Teacher") {
    throw Object.assign(new Error("The class teacher must be an existing teacher"), { status: 400 });
  }
  if (teacher.status !== "Active") {
    throw Object.assign(new Error("That teacher account is inactive"), { status: 400 });
  }
  return id;
}

// POST /api/classes  (admin)
export async function createClass(req, res, next) {
  try {
    const { name, section, academicYear, capacity } = req.body;
    if (!name || !academicYear) {
      res.status(400);
      throw new Error("Name and academic year are required");
    }

    const classTeacher = await checkTeacher(req.body.classTeacher);
    const subjects = await checkSubjects(req.body.subjects);

    const exists = await SchoolClass.findOne({
      name: name.trim(),
      section: (section || "").trim(),
      academicYear: academicYear.trim(),
    });
    if (exists) {
      res.status(409);
      throw new Error("That class already exists for this academic year");
    }

    const created = await SchoolClass.create({
      name,
      section,
      academicYear,
      capacity,
      classTeacher: classTeacher || undefined,
      subjects: subjects || [],
    });

    res.status(201).json({ schoolClass: await populated(SchoolClass.findById(created._id)) });
  } catch (err) {
    if (err.status) res.status(err.status);
    if (err.code === 11000) {
      res.status(409);
      return next(new Error("That class already exists for this academic year"));
    }
    next(err);
  }
}

// GET /api/classes  (any signed in user)
export async function listClasses(req, res, next) {
  try {
    const { academicYear, search, classTeacher } = req.query;
    const filter = {};
    if (academicYear) filter.academicYear = academicYear;
    if (classTeacher && isValidId(classTeacher)) filter.classTeacher = classTeacher;
    if (search) {
      const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: rx }, { section: rx }];
    }

    const classes = await populated(SchoolClass.find(filter).sort({ academicYear: -1, name: 1, section: 1 }));

    // attach the enrolled student count for each class
    const counts = await User.aggregate([
      { $match: { role: "Student", enrollmentStatus: "Enrolled", schoolClass: { $ne: null } } },
      { $group: { _id: "$schoolClass", n: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));

    res.json({
      classes: classes.map((c) => ({ ...c.toJSON(), enrolledCount: countMap[String(c._id)] || 0 })),
      total: classes.length,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/classes/:id  (any signed in user)
export async function getClass(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid class id");
    }
    const schoolClass = await populated(SchoolClass.findById(req.params.id));
    if (!schoolClass) {
      res.status(404);
      throw new Error("Class not found");
    }

    const students = await User.find({ role: "Student", schoolClass: schoolClass._id })
      .select("name admissionNo gender enrollmentStatus")
      .sort({ name: 1 });

    res.json({ schoolClass, students, enrolledCount: students.filter((s) => s.enrollmentStatus === "Enrolled").length });
  } catch (err) {
    next(err);
  }
}

// PUT /api/classes/:id  (admin)
export async function updateClass(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid class id");
    }
    const schoolClass = await SchoolClass.findById(req.params.id);
    if (!schoolClass) {
      res.status(404);
      throw new Error("Class not found");
    }

    const { name, section, academicYear, capacity } = req.body;
    if (name !== undefined) schoolClass.name = name;
    if (section !== undefined) schoolClass.section = section;
    if (academicYear !== undefined) schoolClass.academicYear = academicYear;
    if (capacity !== undefined) schoolClass.capacity = capacity;

    const classTeacher = await checkTeacher(req.body.classTeacher);
    if (classTeacher !== undefined) schoolClass.classTeacher = classTeacher; // null clears it

    const subjects = await checkSubjects(req.body.subjects);
    if (subjects !== undefined) schoolClass.subjects = subjects;

    await schoolClass.save();
    res.json({ schoolClass: await populated(SchoolClass.findById(schoolClass._id)) });
  } catch (err) {
    if (err.status) res.status(err.status);
    if (err.code === 11000) {
      res.status(409);
      return next(new Error("That class already exists for this academic year"));
    }
    next(err);
  }
}

// DELETE /api/classes/:id  (admin)
export async function deleteClass(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid class id");
    }
    const schoolClass = await SchoolClass.findById(req.params.id);
    if (!schoolClass) {
      res.status(404);
      throw new Error("Class not found");
    }

    const students = await User.countDocuments({ role: "Student", schoolClass: schoolClass._id });
    if (students > 0) {
      res.status(409);
      throw new Error(`This class has ${students} student(s). Move them to another class first.`);
    }

    await schoolClass.deleteOne();
    res.json({ message: "Class deleted" });
  } catch (err) {
    next(err);
  }
}

// POST /api/classes/:id/subjects  (admin)   body: { subjectId }
export async function addSubjectToClass(req, res, next) {
  try {
    if (!isValidId(req.params.id) || !isValidId(req.body.subjectId || "")) {
      res.status(400);
      throw new Error("Invalid class or subject id");
    }
    const [schoolClass, subject] = await Promise.all([
      SchoolClass.findById(req.params.id),
      Subject.findById(req.body.subjectId),
    ]);
    if (!schoolClass) {
      res.status(404);
      throw new Error("Class not found");
    }
    if (!subject) {
      res.status(404);
      throw new Error("Subject not found");
    }
    if (schoolClass.subjects.some((s) => s.equals(subject._id))) {
      res.status(409);
      throw new Error("That subject is already on this class");
    }
    schoolClass.subjects.push(subject._id);
    await schoolClass.save();
    res.status(201).json({ schoolClass: await populated(SchoolClass.findById(schoolClass._id)) });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/classes/:id/subjects/:subjectId  (admin)
export async function removeSubjectFromClass(req, res, next) {
  try {
    if (!isValidId(req.params.id) || !isValidId(req.params.subjectId)) {
      res.status(400);
      throw new Error("Invalid class or subject id");
    }
    const schoolClass = await SchoolClass.findById(req.params.id);
    if (!schoolClass) {
      res.status(404);
      throw new Error("Class not found");
    }
    const before = schoolClass.subjects.length;
    schoolClass.subjects = schoolClass.subjects.filter((s) => !s.equals(req.params.subjectId));
    if (schoolClass.subjects.length === before) {
      res.status(404);
      throw new Error("That subject is not on this class");
    }
    await schoolClass.save();
    res.json({ schoolClass: await populated(SchoolClass.findById(schoolClass._id)) });
  } catch (err) {
    next(err);
  }
}
