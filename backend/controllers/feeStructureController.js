import mongoose from "mongoose";
import FeeStructure from "../models/feeStructureModel.js";
import SchoolClass from "../models/schoolClassModel.js";
import Term from "../models/termModel.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const populated = (q) =>
  q.populate("schoolClass", "name section academicYear").populate("term", "name academicYear");

function cleanLineItems(items) {
  if (!Array.isArray(items)) throw Object.assign(new Error("lineItems must be an array"), { status: 400 });
  return items.map((li) => {
    if (!li || !li.label || !(Number(li.amount) >= 0)) {
      throw Object.assign(new Error("Each line item needs a label and a non negative amount"), { status: 400 });
    }
    return { label: String(li.label).trim(), amount: Number(li.amount) };
  });
}

// POST /api/fee-structures  (admin)
export async function createFeeStructure(req, res, next) {
  try {
    const { schoolClass, term } = req.body;
    if (!isValidId(schoolClass || "") || !isValidId(term || "")) {
      res.status(400);
      throw new Error("Valid schoolClass and term are required");
    }
    const [cls, trm] = await Promise.all([SchoolClass.findById(schoolClass), Term.findById(term)]);
    if (!cls) throw Object.assign(new Error("Class not found"), { status: 404 });
    if (!trm) throw Object.assign(new Error("Term not found"), { status: 404 });

    if (await FeeStructure.findOne({ schoolClass, term })) {
      res.status(409);
      throw new Error("A fee structure already exists for this class and term");
    }

    const doc = await FeeStructure.create({
      schoolClass,
      term,
      lineItems: cleanLineItems(req.body.lineItems || []),
    });
    res.status(201).json({ feeStructure: await populated(FeeStructure.findById(doc._id)) });
  } catch (err) {
    if (err.status) res.status(err.status);
    next(err);
  }
}

// GET /api/fee-structures  (any signed in)  ?schoolClass=&term=
export async function listFeeStructures(req, res, next) {
  try {
    const filter = {};
    if (req.query.schoolClass && isValidId(req.query.schoolClass)) filter.schoolClass = req.query.schoolClass;
    if (req.query.term && isValidId(req.query.term)) filter.term = req.query.term;
    const items = await populated(FeeStructure.find(filter).sort({ createdAt: -1 }));
    res.json({ feeStructures: items, total: items.length });
  } catch (err) {
    next(err);
  }
}

// GET /api/fee-structures/:id
export async function getFeeStructure(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid fee structure id");
    }
    const doc = await populated(FeeStructure.findById(req.params.id));
    if (!doc) {
      res.status(404);
      throw new Error("Fee structure not found");
    }
    res.json({ feeStructure: doc });
  } catch (err) {
    next(err);
  }
}

// PUT /api/fee-structures/:id  (admin)
export async function updateFeeStructure(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid fee structure id");
    }
    const doc = await FeeStructure.findById(req.params.id);
    if (!doc) {
      res.status(404);
      throw new Error("Fee structure not found");
    }
    if (req.body.lineItems !== undefined) doc.lineItems = cleanLineItems(req.body.lineItems);
    await doc.save();
    res.json({ feeStructure: await populated(FeeStructure.findById(doc._id)) });
  } catch (err) {
    if (err.status) res.status(err.status);
    next(err);
  }
}

// DELETE /api/fee-structures/:id  (admin)
export async function deleteFeeStructure(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid fee structure id");
    }
    const doc = await FeeStructure.findById(req.params.id);
    if (!doc) {
      res.status(404);
      throw new Error("Fee structure not found");
    }
    await doc.deleteOne();
    res.json({ message: "Fee structure deleted" });
  } catch (err) {
    next(err);
  }
}
