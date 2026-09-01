import mongoose from "mongoose";
import Application from "../models/applicationModel.js";
import SchoolClass from "../models/schoolClassModel.js";
import User from "../models/userModel.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /api/applications   (public)
export async function submitApplication(req, res, next) {
  try {
    const { childName, parentName, parentPhone } = req.body;
    if (!childName || !parentName || !parentPhone) {
      res.status(400);
      throw new Error("Child name, parent name and parent phone are required");
    }
    const app = await Application.create({
      childName,
      dob: req.body.dob,
      gender: req.body.gender,
      gradeApplyingFor: req.body.gradeApplyingFor,
      parentName,
      parentPhone,
      parentEmail: req.body.parentEmail,
      message: req.body.message,
    });
    res.status(201).json({
      message: "Your application has been received. The school will contact you.",
      applicationId: app._id,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/applications   (admin)   ?status=
export async function listApplications(req, res, next) {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const applications = await Application.find(filter)
      .populate("reviewedBy", "name")
      .populate("createdStudent", "name admissionNo")
      .sort({ createdAt: -1 });
    res.json({ applications, total: applications.length });
  } catch (err) {
    next(err);
  }
}

// GET /api/applications/:id   (admin)
export async function getApplication(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid application id");
    }
    const app = await Application.findById(req.params.id)
      .populate("reviewedBy", "name")
      .populate("createdStudent", "name admissionNo");
    if (!app) {
      res.status(404);
      throw new Error("Application not found");
    }
    res.json({ application: app });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/applications/:id/review   (admin)
// body: { status, reviewNote, admissionNo?, password?, schoolClass? }
// setting status to Accepted with admissionNo + password creates the student
export async function reviewApplication(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid application id");
    }
    const app = await Application.findById(req.params.id);
    if (!app) {
      res.status(404);
      throw new Error("Application not found");
    }

    const { status, reviewNote } = req.body;
    if (status && !["New", "Reviewing", "Accepted", "Rejected"].includes(status)) {
      res.status(400);
      throw new Error("Invalid status");
    }
    if (status) app.status = status;
    if (reviewNote !== undefined) app.reviewNote = reviewNote;
    app.reviewedBy = req.user._id;

    let createdStudent = null;
    if (app.status === "Accepted" && !app.createdStudent && req.body.admissionNo && req.body.password) {
      if (String(req.body.password).length < 6) {
        res.status(400);
        throw new Error("The student password must be at least 6 characters");
      }
      if (await User.findOne({ admissionNo: String(req.body.admissionNo).toUpperCase() })) {
        res.status(409);
        throw new Error("That admission number is already in use");
      }
      let schoolClass;
      if (req.body.schoolClass) {
        if (!isValidId(req.body.schoolClass)) {
          res.status(400);
          throw new Error("Invalid schoolClass");
        }
        const cls = await SchoolClass.findById(req.body.schoolClass);
        if (!cls) {
          res.status(404);
          throw new Error("Class not found");
        }
        schoolClass = cls._id;
      }
      createdStudent = await User.create({
        name: app.childName,
        admissionNo: req.body.admissionNo,
        password: req.body.password,
        role: "Student",
        status: "Active",
        mustChangePassword: true,
        gender: app.gender,
        dob: app.dob,
        schoolClass,
        enrolledAt: new Date(),
        enrollmentStatus: "Enrolled",
      });
      app.createdStudent = createdStudent._id;
    }

    await app.save();
    res.json({
      application: await Application.findById(app._id)
        .populate("reviewedBy", "name")
        .populate("createdStudent", "name admissionNo"),
      createdStudent: createdStudent ? createdStudent.toSafeJSON() : null,
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/applications/:id   (admin)
export async function deleteApplication(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid application id");
    }
    const app = await Application.findById(req.params.id);
    if (!app) {
      res.status(404);
      throw new Error("Application not found");
    }
    await app.deleteOne();
    res.json({ message: "Application deleted" });
  } catch (err) {
    next(err);
  }
}
