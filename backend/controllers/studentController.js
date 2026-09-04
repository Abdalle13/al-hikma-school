import mongoose from "mongoose";
import User from "../models/userModel.js";
import SchoolClass from "../models/schoolClassModel.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const populatedStudent = (q) =>
  q
    .populate("schoolClass", "name section academicYear")
    .populate("guardians.user", "name email phone role status");

// checks the class exists and has room for one more enrolled student.
// pass the current student id when moving a student so they are not counted twice.
async function checkClassHasRoom(classId, currentStudentId) {
  if (classId === undefined) return undefined;
  if (classId === null || classId === "") return null;
  if (!isValidId(classId)) throw Object.assign(new Error("Invalid class id"), { status: 400 });

  const schoolClass = await SchoolClass.findById(classId);
  if (!schoolClass) throw Object.assign(new Error("Class not found"), { status: 400 });

  const filter = { role: "Student", schoolClass: classId, enrollmentStatus: "Enrolled" };
  if (currentStudentId) filter._id = { $ne: currentStudentId };
  const enrolled = await User.countDocuments(filter);
  if (enrolled >= schoolClass.capacity) {
    throw Object.assign(
      new Error(`${schoolClass.name} ${schoolClass.section || ""} is full (${schoolClass.capacity})`.trim()),
      { status: 409 }
    );
  }
  return classId;
}

// generates the next admission number for the current year: "STU", the four
// digit enrolment year, then a four digit sequence, e.g. STU20260001. never
// reused even after a student is removed.
export async function nextAdmissionNo() {
  const prefix = `STU${new Date().getFullYear()}`;
  const last = await User.findOne({ admissionNo: { $regex: `^${prefix}\\d{4}$` } })
    .select("admissionNo")
    .sort({ admissionNo: -1 });
  const seq = last ? parseInt(last.admissionNo.slice(prefix.length), 10) + 1 : 1;
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

// GET /api/students/next-admission-no  (admin)
export async function suggestAdmissionNo(req, res, next) {
  try {
    res.json({ admissionNo: await nextAdmissionNo() });
  } catch (err) {
    next(err);
  }
}

// POST /api/students  (admin)
export async function createStudent(req, res, next) {
  try {
    const { name, password, dob, gender, phone } = req.body;

    if (!name || !password) {
      res.status(400);
      throw new Error("Name and password are required");
    }
    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }
    if (gender && !["Male", "Female"].includes(gender)) {
      res.status(400);
      throw new Error("Gender must be Male or Female");
    }

    let admissionNo = req.body.admissionNo ? String(req.body.admissionNo).toUpperCase() : "";
    if (admissionNo) {
      if (await User.findOne({ admissionNo })) {
        res.status(409);
        throw new Error("That admission number is already in use");
      }
    } else {
      admissionNo = await nextAdmissionNo();
    }

    const schoolClass = await checkClassHasRoom(req.body.schoolClass);

    const student = await User.create({
      name,
      admissionNo,
      password,
      dob,
      gender,
      phone,
      role: "Student",
      status: "Active",
      mustChangePassword: true,
      schoolClass: schoolClass || undefined,
      enrolledAt: new Date(),
      enrollmentStatus: "Enrolled",
    });

    const fresh = await populatedStudent(User.findById(student._id));
    res.status(201).json({ student: fresh.toSafeJSON() });
  } catch (err) {
    if (err.status) res.status(err.status);
    if (err.code === 11000) {
      res.status(409);
      return next(new Error("That admission number is already in use"));
    }
    next(err);
  }
}

// GET /api/students  (any signed in user, teachers and admins in practice)
export async function listStudents(req, res, next) {
  try {
    const { schoolClass, enrollmentStatus, gender, search } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 20));

    const filter = { role: "Student" };
    if (schoolClass && isValidId(schoolClass)) filter.schoolClass = schoolClass;
    if (enrollmentStatus) filter.enrollmentStatus = enrollmentStatus;
    if (gender) filter.gender = gender;
    if (search) {
      const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: rx }, { admissionNo: rx }, { phone: rx }];
    }

    const [docs, total] = await Promise.all([
      User.find(filter)
        .populate("schoolClass", "name section academicYear")
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      students: docs.map((d) => d.toSafeJSON()),
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/students/:id
export async function getStudent(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid student id");
    }
    const student = await populatedStudent(User.findOne({ _id: req.params.id, role: "Student" }));
    if (!student) {
      res.status(404);
      throw new Error("Student not found");
    }
    res.json({ student: student.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

// PUT /api/students/:id  (admin)
export async function updateStudent(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid student id");
    }
    const student = await User.findOne({ _id: req.params.id, role: "Student" }).select("+password");
    if (!student) {
      res.status(404);
      throw new Error("Student not found");
    }

    const { name, phone, dob, gender, photo, admissionNo, enrollmentStatus, password } = req.body;

    if (typeof name === "string") student.name = name;
    if (typeof phone === "string") student.phone = phone;
    if (typeof photo === "string") student.photo = photo;
    if (dob !== undefined) student.dob = dob;

    if (gender !== undefined) {
      if (gender && !["Male", "Female"].includes(gender)) {
        res.status(400);
        throw new Error("Gender must be Male or Female");
      }
      student.gender = gender || undefined;
    }

    if (admissionNo !== undefined) {
      const taken = await User.findOne({
        admissionNo: String(admissionNo).toUpperCase(),
        _id: { $ne: student._id },
      });
      if (taken) {
        res.status(409);
        throw new Error("That admission number is already in use");
      }
      student.admissionNo = admissionNo;
    }

    if (enrollmentStatus !== undefined) {
      if (!["Enrolled", "Graduated", "Withdrawn"].includes(enrollmentStatus)) {
        res.status(400);
        throw new Error("Enrollment status must be Enrolled, Graduated or Withdrawn");
      }
      student.enrollmentStatus = enrollmentStatus;
    }

    if ("schoolClass" in req.body) {
      const goingEnrolled = (enrollmentStatus || student.enrollmentStatus) === "Enrolled";
      const target = await checkClassHasRoom(
        req.body.schoolClass,
        goingEnrolled ? student._id : null
      );
      student.schoolClass = target || undefined;
    }

    if (password) {
      if (password.length < 6) {
        res.status(400);
        throw new Error("Password must be at least 6 characters");
      }
      student.password = password;
      student.mustChangePassword = true;
    }

    await student.save();
    res.json({ student: (await populatedStudent(User.findById(student._id))).toSafeJSON() });
  } catch (err) {
    if (err.status) res.status(err.status);
    if (err.code === 11000) {
      res.status(409);
      return next(new Error("That admission number is already in use"));
    }
    next(err);
  }
}

// DELETE /api/students/:id  (admin)
export async function deleteStudent(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid student id");
    }
    const student = await User.findOne({ _id: req.params.id, role: "Student" });
    if (!student) {
      res.status(404);
      throw new Error("Student not found");
    }

    // attendance, marks and invoices arrive later. once a student has any of
    // them, withdraw the student instead of deleting. nothing links yet.
    await student.deleteOne();
    res.json({ message: "Student deleted" });
  } catch (err) {
    next(err);
  }
}
