import mongoose from "mongoose";
import Invoice from "../models/invoiceModel.js";
import FeeStructure from "../models/feeStructureModel.js";
import SchoolClass from "../models/schoolClassModel.js";
import Term from "../models/termModel.js";
import User from "../models/userModel.js";
import { simulateCharge } from "../utils/mobileMoney.js";
import { notifyGuardians } from "../utils/notify.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const populated = (q) =>
  q
    .populate("student", "name admissionNo")
    .populate("term", "name academicYear")
    .populate("schoolClass", "name section");

// admin sees all, a parent sees their children's, a student sees their own
async function scopeFilter(user) {
  if (user.role === "Admin" || user.role === "Teacher") return {};
  if (user.role === "Student") return { student: user._id };
  if (user.role === "Parent") {
    const kids = await User.find({ role: "Student", "guardians.user": user._id }).select("_id");
    return { student: { $in: kids.map((k) => k._id) } };
  }
  return { student: null };
}

async function canTouchInvoice(user, invoice) {
  if (user.role === "Admin") return true;
  if (user.role === "Student") return user._id.equals(invoice.student);
  if (user.role === "Parent") {
    return Boolean(
      await User.exists({ _id: invoice.student, role: "Student", "guardians.user": user._id })
    );
  }
  return false;
}

// POST /api/invoices/generate  (admin)   body: { term, schoolClass }
export async function generateInvoices(req, res, next) {
  try {
    const { term, schoolClass } = req.body;
    if (!isValidId(term || "") || !isValidId(schoolClass || "")) {
      res.status(400);
      throw new Error("Valid term and schoolClass are required");
    }
    const [trm, cls, structure] = await Promise.all([
      Term.findById(term),
      SchoolClass.findById(schoolClass),
      FeeStructure.findOne({ schoolClass, term }),
    ]);
    if (!trm) throw Object.assign(new Error("Term not found"), { status: 404 });
    if (!cls) throw Object.assign(new Error("Class not found"), { status: 404 });
    if (!structure) {
      res.status(400);
      throw new Error("Set a fee structure for this class and term first");
    }

    const students = await User.find({
      role: "Student",
      schoolClass,
      enrollmentStatus: "Enrolled",
    }).select("_id");

    const already = await Invoice.find({
      term,
      student: { $in: students.map((s) => s._id) },
    }).select("student");
    const has = new Set(already.map((a) => String(a.student)));

    const toCreate = students
      .filter((s) => !has.has(String(s._id)))
      .map((s) => ({
        student: s._id,
        term,
        schoolClass,
        lineItems: structure.lineItems.map((li) => ({ label: li.label, amount: li.amount })),
        total: structure.total,
        dueDate: trm.endDate,
        balance: structure.total,
        status: "Unpaid",
      }));

    if (toCreate.length) await Invoice.insertMany(toCreate);

    res.json({
      message: `Created ${toCreate.length} invoice(s), skipped ${has.size} that already existed`,
      created: toCreate.length,
      skipped: has.size,
    });
  } catch (err) {
    if (err.status) res.status(err.status);
    next(err);
  }
}

// GET /api/invoices   filters: student, term, schoolClass, status
export async function listInvoices(req, res, next) {
  try {
    const filter = await scopeFilter(req.user);
    if (req.query.student && isValidId(req.query.student)) {
      // narrow, but keep the scope guard
      if (filter.student && filter.student.$in) {
        if (!filter.student.$in.some((id) => String(id) === req.query.student)) {
          return res.json({ invoices: [], total: 0 });
        }
      }
      filter.student = req.query.student;
    }
    if (req.query.term && isValidId(req.query.term)) filter.term = req.query.term;
    if (req.query.schoolClass && isValidId(req.query.schoolClass)) filter.schoolClass = req.query.schoolClass;
    if (req.query.status) filter.status = req.query.status;

    const invoices = await populated(Invoice.find(filter).sort({ createdAt: -1 }));
    const totals = invoices.reduce(
      (acc, i) => {
        acc.billed += i.total;
        acc.paid += i.amountPaid;
        acc.outstanding += i.balance;
        return acc;
      },
      { billed: 0, paid: 0, outstanding: 0 }
    );
    res.json({ invoices, total: invoices.length, totals });
  } catch (err) {
    next(err);
  }
}

// GET /api/invoices/:id
export async function getInvoice(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid invoice id");
    }
    const invoice = await populated(Invoice.findById(req.params.id));
    if (!invoice) {
      res.status(404);
      throw new Error("Invoice not found");
    }
    if (!(await canTouchInvoice(req.user, invoice)) && req.user.role !== "Teacher") {
      res.status(403);
      throw new Error("You do not have access to this invoice");
    }
    res.json({ invoice });
  } catch (err) {
    next(err);
  }
}

// PUT /api/invoices/:id  (admin)   body: { lineItems, dueDate }
export async function updateInvoice(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid invoice id");
    }
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      res.status(404);
      throw new Error("Invoice not found");
    }

    if (req.body.lineItems !== undefined) {
      if (!Array.isArray(req.body.lineItems)) {
        res.status(400);
        throw new Error("lineItems must be an array");
      }
      const items = req.body.lineItems.map((li) => {
        if (!li.label || !(Number(li.amount) >= 0)) {
          throw Object.assign(new Error("Each line item needs a label and a non negative amount"), {
            status: 400,
          });
        }
        return { label: String(li.label).trim(), amount: Number(li.amount) };
      });
      const newTotal = items.reduce((s, li) => s + li.amount, 0);
      if (newTotal < invoice.amountPaid) {
        res.status(400);
        throw new Error("The new total is below what has already been paid");
      }
      invoice.lineItems = items;
      invoice.total = newTotal;
    }
    if (req.body.dueDate !== undefined) invoice.dueDate = req.body.dueDate;

    invoice.recalculate();
    await invoice.save();
    res.json({ invoice: await populated(Invoice.findById(invoice._id)) });
  } catch (err) {
    if (err.status) res.status(err.status);
    next(err);
  }
}

// POST /api/invoices/:id/installment-plan  (admin)
// body: { installments: [{ amount, dueDate }] }   2 to 4, must sum to the total
export async function setInstallmentPlan(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid invoice id");
    }
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      res.status(404);
      throw new Error("Invoice not found");
    }

    const { installments } = req.body;
    if (!Array.isArray(installments) || installments.length < 2 || installments.length > 4) {
      res.status(400);
      throw new Error("An installment plan needs between 2 and 4 payments");
    }
    const clean = installments.map((it) => {
      if (!(Number(it.amount) > 0) || !it.dueDate) {
        throw Object.assign(new Error("Each installment needs an amount and a due date"), { status: 400 });
      }
      return { amount: Number(it.amount), dueDate: new Date(it.dueDate), paid: false };
    });
    const sum = Math.round(clean.reduce((s, i) => s + i.amount, 0) * 100) / 100;
    if (sum !== invoice.total) {
      res.status(400);
      throw new Error(`The installments must add up to the invoice total (${invoice.total})`);
    }

    invoice.installmentPlan = { enabled: true, installments: clean };
    invoice.recalculate();
    await invoice.save();
    res.json({ invoice: await populated(Invoice.findById(invoice._id)) });
  } catch (err) {
    if (err.status) res.status(err.status);
    next(err);
  }
}

// DELETE /api/invoices/:id/installment-plan  (admin)
export async function clearInstallmentPlan(req, res, next) {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      res.status(404);
      throw new Error("Invoice not found");
    }
    invoice.installmentPlan = { enabled: false, installments: [] };
    await invoice.save();
    res.json({ invoice: await populated(Invoice.findById(invoice._id)) });
  } catch (err) {
    next(err);
  }
}

async function applyPayment(invoice, payment, actor) {
  if (payment.amount > invoice.balance + 0.001) {
    const over = new Error(`That is more than the outstanding balance (${invoice.balance})`);
    over.status = 400;
    throw over;
  }
  invoice.payments.push({ ...payment, recordedBy: actor?._id });
  invoice.recalculate();
  await invoice.save();

  // let a guardian know a payment landed
  const student = await User.findById(invoice.student).select("name admissionNo guardians");
  if (student) {
    await notifyGuardians(student, {
      channel: "sms",
      content: `Payment of ${payment.amount} received for ${student.name}. Balance now ${invoice.balance}.`,
      relatedTo: "fee",
      relatedId: invoice._id,
    });
  }
  return invoice;
}

// POST /api/invoices/:id/pay   (admin, or a parent of the student)
// simulated mobile money. body: { amount, phone, pin, method }
export async function payInvoice(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid invoice id");
    }
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      res.status(404);
      throw new Error("Invoice not found");
    }
    if (!(await canTouchInvoice(req.user, invoice))) {
      res.status(403);
      throw new Error("You cannot pay this invoice");
    }
    if (invoice.status === "Paid") {
      res.status(400);
      throw new Error("This invoice is already paid");
    }

    const amount = Number(req.body.amount);
    const method = req.body.method === "zaad" ? "zaad" : "evc";
    const result = simulateCharge({ phone: req.body.phone, pin: req.body.pin, amount, method });
    if (!result.approved) {
      res.status(402);
      throw new Error(result.message);
    }

    await applyPayment(
      invoice,
      { amount, method, reference: result.reference, phone: String(req.body.phone), date: new Date() },
      req.user
    );

    res.json({
      message: "Payment approved",
      reference: result.reference,
      invoice: await populated(Invoice.findById(invoice._id)),
    });
  } catch (err) {
    if (err.status) res.status(err.status);
    next(err);
  }
}

// POST /api/invoices/:id/record-cash  (admin)
// body: { amount, reference, date }
export async function recordCash(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid invoice id");
    }
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      res.status(404);
      throw new Error("Invoice not found");
    }
    const amount = Number(req.body.amount);
    if (!(amount > 0)) {
      res.status(400);
      throw new Error("Amount must be greater than 0");
    }
    if (invoice.status === "Paid") {
      res.status(400);
      throw new Error("This invoice is already paid");
    }

    await applyPayment(
      invoice,
      {
        amount,
        method: "cash",
        reference: req.body.reference || `CASH-${Date.now().toString(36).toUpperCase()}`,
        date: req.body.date ? new Date(req.body.date) : new Date(),
      },
      req.user
    );

    res.json({ message: "Cash payment recorded", invoice: await populated(Invoice.findById(invoice._id)) });
  } catch (err) {
    if (err.status) res.status(err.status);
    next(err);
  }
}

// GET /api/invoices/:id/receipt?payment=<index>
export async function invoiceReceipt(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid invoice id");
    }
    const invoice = await populated(Invoice.findById(req.params.id));
    if (!invoice) {
      res.status(404);
      throw new Error("Invoice not found");
    }
    if (!(await canTouchInvoice(req.user, invoice)) && req.user.role !== "Teacher") {
      res.status(403);
      throw new Error("You do not have access to this invoice");
    }
    if (!invoice.payments.length) {
      res.status(400);
      throw new Error("This invoice has no payments yet");
    }

    const idx = req.query.payment !== undefined ? Number(req.query.payment) : invoice.payments.length - 1;
    const payment = invoice.payments[idx];
    if (!payment) {
      res.status(404);
      throw new Error("That payment does not exist");
    }

    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    const navy = [30, 58, 95];

    doc.setFontSize(18);
    doc.setTextColor(...navy);
    doc.text("Payment receipt", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text(`Student: ${invoice.student.name} (${invoice.student.admissionNo || "-"})`, 14, 30);
    doc.text(`Term: ${invoice.term.name} (${invoice.term.academicYear})`, 14, 36);
    doc.text(`Receipt ref: ${payment.reference || "-"}`, 14, 42);
    doc.text(`Date: ${new Date(payment.date).toISOString().slice(0, 10)}`, 14, 48);
    doc.text(`Method: ${payment.method.toUpperCase()}`, 14, 54);

    autoTable(doc, {
      startY: 62,
      head: [["Description", "Amount"]],
      body: [
        ["Amount paid", String(payment.amount)],
        ["Invoice total", String(invoice.total)],
        ["Total paid to date", String(invoice.amountPaid)],
        ["Balance", String(invoice.balance)],
      ],
      headStyles: { fillColor: navy },
      styles: { fontSize: 10 },
    });

    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text("Simulated payment. No real money moved. See the project readme.", 14, doc.lastAutoTable.finalY + 12);

    const buffer = Buffer.from(doc.output("arraybuffer"));
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="receipt-${payment.reference || idx}.pdf"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

// GET /api/invoices/balances  (admin)   ?term=&schoolClass=
export async function balances(req, res, next) {
  try {
    const match = {};
    if (req.query.term && isValidId(req.query.term)) match.term = new mongoose.Types.ObjectId(req.query.term);
    if (req.query.schoolClass && isValidId(req.query.schoolClass)) {
      match.schoolClass = new mongoose.Types.ObjectId(req.query.schoolClass);
    }

    const rows = await Invoice.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          billed: { $sum: "$total" },
          paid: { $sum: "$amountPaid" },
          outstanding: { $sum: "$balance" },
        },
      },
    ]);

    const summary = { Unpaid: null, Partial: null, Paid: null };
    let billed = 0;
    let paid = 0;
    let outstanding = 0;
    for (const r of rows) {
      summary[r._id] = { count: r.count, billed: r.billed, paid: r.paid, outstanding: r.outstanding };
      billed += r.billed;
      paid += r.paid;
      outstanding += r.outstanding;
    }
    const collectionRate = billed ? Math.round((paid / billed) * 1000) / 10 : null;

    // overdue: has a balance and the due date has passed
    const overdue = await Invoice.countDocuments({
      ...match,
      balance: { $gt: 0 },
      dueDate: { $lt: new Date() },
    });

    res.json({ byStatus: summary, billed, paid, outstanding, collectionRate, overdueCount: overdue });
  } catch (err) {
    next(err);
  }
}
