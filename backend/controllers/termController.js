import mongoose from "mongoose";
import Term from "../models/termModel.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// clears isActive on every term except the one passed
async function makeOnlyActive(termId) {
  await Term.updateMany({ _id: { $ne: termId } }, { $set: { isActive: false } });
  await Term.updateOne({ _id: termId }, { $set: { isActive: true } });
}

// POST /api/terms  (admin)
export async function createTerm(req, res, next) {
  try {
    const { name, academicYear, startDate, endDate, isActive } = req.body;
    if (!name || !academicYear || !startDate || !endDate) {
      res.status(400);
      throw new Error("Name, academic year, start date and end date are required");
    }

    if (await Term.findOne({ name: name.trim(), academicYear: academicYear.trim() })) {
      res.status(409);
      throw new Error("That term already exists for this academic year");
    }

    const term = await Term.create({ name, academicYear, startDate, endDate, isActive: false });
    if (isActive) await makeOnlyActive(term._id);

    res.status(201).json({ term: await Term.findById(term._id) });
  } catch (err) {
    if (err.code === 11000) {
      res.status(409);
      return next(new Error("That term already exists for this academic year"));
    }
    next(err);
  }
}

// GET /api/terms  (any signed in user)
export async function listTerms(req, res, next) {
  try {
    const { academicYear, isActive } = req.query;
    const filter = {};
    if (academicYear) filter.academicYear = academicYear;
    if (isActive === "true") filter.isActive = true;
    if (isActive === "false") filter.isActive = false;

    const terms = await Term.find(filter).sort({ academicYear: -1, startDate: 1 });
    res.json({ terms, total: terms.length });
  } catch (err) {
    next(err);
  }
}

// GET /api/terms/active  (any signed in user)
export async function getActiveTerm(req, res, next) {
  try {
    const term = await Term.findOne({ isActive: true });
    if (!term) {
      res.status(404);
      throw new Error("No active term is set");
    }
    res.json({ term });
  } catch (err) {
    next(err);
  }
}

// GET /api/terms/:id
export async function getTerm(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid term id");
    }
    const term = await Term.findById(req.params.id);
    if (!term) {
      res.status(404);
      throw new Error("Term not found");
    }
    res.json({ term });
  } catch (err) {
    next(err);
  }
}

// PUT /api/terms/:id  (admin)
export async function updateTerm(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid term id");
    }
    const term = await Term.findById(req.params.id);
    if (!term) {
      res.status(404);
      throw new Error("Term not found");
    }

    const { name, academicYear, startDate, endDate, isActive } = req.body;
    if (name !== undefined) term.name = name;
    if (academicYear !== undefined) term.academicYear = academicYear;
    if (startDate !== undefined) term.startDate = startDate;
    if (endDate !== undefined) term.endDate = endDate;

    await term.save();

    if (isActive === true) await makeOnlyActive(term._id);
    if (isActive === false) await Term.updateOne({ _id: term._id }, { $set: { isActive: false } });

    res.json({ term: await Term.findById(term._id) });
  } catch (err) {
    if (err.code === 11000) {
      res.status(409);
      return next(new Error("That term already exists for this academic year"));
    }
    next(err);
  }
}

// POST /api/terms/:id/activate  (admin)
export async function activateTerm(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid term id");
    }
    const term = await Term.findById(req.params.id);
    if (!term) {
      res.status(404);
      throw new Error("Term not found");
    }
    await makeOnlyActive(term._id);
    res.json({ term: await Term.findById(term._id) });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/terms/:id  (admin)
export async function deleteTerm(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid term id");
    }
    const term = await Term.findById(req.params.id);
    if (!term) {
      res.status(404);
      throw new Error("Term not found");
    }
    if (term.isActive) {
      res.status(409);
      throw new Error("This is the active term. Activate another term before deleting it.");
    }
    await term.deleteOne();
    res.json({ message: "Term deleted" });
  } catch (err) {
    next(err);
  }
}
