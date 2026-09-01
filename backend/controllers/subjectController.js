import mongoose from "mongoose";
import Subject from "../models/subjectModel.js";
import SchoolClass from "../models/schoolClassModel.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /api/subjects  (admin)
export async function createSubject(req, res, next) {
  try {
    const { name, code, gradeLevel, description } = req.body;
    if (!name || !code) {
      res.status(400);
      throw new Error("Name and code are required");
    }

    if (await Subject.findOne({ code: code.toUpperCase() })) {
      res.status(409);
      throw new Error("That subject code is already in use");
    }

    const subject = await Subject.create({ name, code, gradeLevel, description });
    res.status(201).json({ subject });
  } catch (err) {
    if (err.code === 11000) {
      res.status(409);
      return next(new Error("That subject code is already in use"));
    }
    next(err);
  }
}

// GET /api/subjects  (any signed in user)
export async function listSubjects(req, res, next) {
  try {
    const { search, gradeLevel } = req.query;
    const filter = {};
    if (gradeLevel) filter.gradeLevel = gradeLevel;
    if (search) {
      const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: rx }, { code: rx }];
    }
    const subjects = await Subject.find(filter).sort({ name: 1 });
    res.json({ subjects, total: subjects.length });
  } catch (err) {
    next(err);
  }
}

// GET /api/subjects/:id
export async function getSubject(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid subject id");
    }
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      res.status(404);
      throw new Error("Subject not found");
    }
    res.json({ subject });
  } catch (err) {
    next(err);
  }
}

// PUT /api/subjects/:id  (admin)
export async function updateSubject(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid subject id");
    }
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      res.status(404);
      throw new Error("Subject not found");
    }

    const { name, code, gradeLevel, description } = req.body;

    if (code && code.toUpperCase() !== subject.code) {
      if (await Subject.findOne({ code: code.toUpperCase(), _id: { $ne: subject._id } })) {
        res.status(409);
        throw new Error("That subject code is already in use");
      }
      subject.code = code;
    }
    if (typeof name === "string") subject.name = name;
    if (gradeLevel !== undefined) subject.gradeLevel = gradeLevel;
    if (description !== undefined) subject.description = description;

    await subject.save();
    res.json({ subject });
  } catch (err) {
    if (err.code === 11000) {
      res.status(409);
      return next(new Error("That subject code is already in use"));
    }
    next(err);
  }
}

// DELETE /api/subjects/:id  (admin)
export async function deleteSubject(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid subject id");
    }
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      res.status(404);
      throw new Error("Subject not found");
    }

    const usedBy = await SchoolClass.countDocuments({ subjects: subject._id });
    if (usedBy > 0) {
      res.status(409);
      throw new Error(`This subject is on ${usedBy} class(es). Remove it from them first.`);
    }

    await subject.deleteOne();
    res.json({ message: "Subject deleted" });
  } catch (err) {
    next(err);
  }
}
