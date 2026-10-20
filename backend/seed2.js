/**
 * Al-Hikma School - Comprehensive Additive Seed Script
 *
 * ONLY ADDS new data, NEVER clears or deletes existing records in database.
 * - Historical terms from 2013/2014 to 2025/2026 (3 terms each year)
 * - Somali Teachers (emails with NO DOTS ending in @gmail.com)
 * - Somali Students across grades with fee categories & discounts
 * - Somali Parents (emails with NO DOTS ending in @gmail.com)
 * - Fee structures for all terms & classes
 * - Invoices with historical payments (EVC Plus, cash, etc.)
 * - Exams & Marks (Midterm & Final)
 * - Attendance records for school days
 * - Announcements
 *
 * Usage: node seed2.js
 */

import "dotenv/config";
import "colors";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import User from "./models/userModel.js";
import SchoolClass from "./models/schoolClassModel.js";
import Subject from "./models/subjectModel.js";
import Term from "./models/termModel.js";
import FeeStructure from "./models/feeStructureModel.js";
import Invoice from "./models/invoiceModel.js";
import Exam from "./models/examModel.js";
import Mark from "./models/markModel.js";
import Attendance from "./models/attendanceModel.js";
import Announcement from "./models/announcementModel.js";

const log  = (m) => console.log(m);
const ok   = (m) => console.log("  [OK]  " + m);
const info = (m) => console.log("  [->]  " + m);

function dob(yearsAgo) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - yearsAgo);
  return d;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function cleanEmail(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "") + "@gmail.com";
}

function buildHistoricalTerms() {
  const terms = [];
  for (let startYear = 2013; startYear <= 2025; startYear++) {
    const endYear = startYear + 1;
    const academicYear = `${startYear}/${endYear}`;
    terms.push({
      name: "Term 1",
      academicYear,
      startDate: new Date(`${startYear}-09-01`),
      endDate: new Date(`${startYear}-12-20`),
      isActive: false,
    });
    terms.push({
      name: "Term 2",
      academicYear,
      startDate: new Date(`${endYear}-01-10`),
      endDate: new Date(`${endYear}-04-15`),
      isActive: academicYear === "2025/2026",
    });
    terms.push({
      name: "Term 3",
      academicYear,
      startDate: new Date(`${endYear}-05-01`),
      endDate: new Date(`${endYear}-07-31`),
      isActive: false,
    });
  }
  return terms;
}

const SOMALI_TEACHERS = [
  {
    name: "Ustadh Maxamed Cabdi Cali",
    email: "maxamedcali@gmail.com",
    employeeId: "TCH001",
    qualification: "B.A. Islamic Studies & Arabic",
    specialization: "Islamic Studies & Tarbiya",
    phone: "+252615111001",
  },
  {
    name: "Ustaada Saynab Xasan Nuur",
    email: "saynabxasan@gmail.com",
    employeeId: "TCH002",
    qualification: "B.Sc Mathematics",
    specialization: "Pure Mathematics",
    phone: "+252615111002",
  },
  {
    name: "Ustadh Cabdullaahi Cumar Warsame",
    email: "cabdullaahicumar@gmail.com",
    employeeId: "TCH003",
    qualification: "B.Sc Education",
    specialization: "General Science & Biology",
    phone: "+252615111003",
  },
  {
    name: "Ustaada Faadumo Jaamac Cilmi",
    email: "faadumojaamac@gmail.com",
    employeeId: "TCH004",
    qualification: "B.A. Education",
    specialization: "Somali Language & Literature",
    phone: "+252615111004",
  },
  {
    name: "Ustadh Guuleed Axmed Salaad",
    email: "guuleedaxmed@gmail.com",
    employeeId: "TCH005",
    qualification: "B.A. English Literature",
    specialization: "English & Social Studies",
    phone: "+252615111005",
  },
  {
    name: "Ustaada Deeqa Ibraahim Maxamuud",
    email: "deeqaibraahim@gmail.com",
    employeeId: "TCH006",
    qualification: "B.Sc Computer Science",
    specialization: "ICT & Technology",
    phone: "+252615111006",
  },
];

const EXTRA_STUDENTS = [
  { name: "Liibaan Maxamed Bile",    gender: "Male",   dob: dob(7),  gradeIndex: 0, feeCategory: "Regular",     motherName: "Caasha Bile",      phone: "+252614600001" },
  { name: "Naadifo Cali Axmed",     gender: "Female", dob: dob(6),  gradeIndex: 0, feeCategory: "Orphan",      motherName: "Xaliimo Axmed",     phone: "+252614600002" },
  { name: "Keyse Yuusuf Dheere",    gender: "Male",   dob: dob(7),  gradeIndex: 0, feeCategory: "Regular",     motherName: "Deeqa Dheere",     phone: "+252614600003" },
  { name: "Fadumo Axmed Guure",     gender: "Female", dob: dob(8),  gradeIndex: 1, feeCategory: "Scholarship", motherName: "Sahra Guure",      phone: "+252614600004", sponsorName: "Amal Foundation" },
  { name: "Bile Ibraahin Warsame",  gender: "Male",   dob: dob(8),  gradeIndex: 1, feeCategory: "Regular",     motherName: "Faadumo Warsame",  phone: "+252614600005" },
  { name: "Asad Cumar Jaamac",      gender: "Male",   dob: dob(8),  gradeIndex: 1, feeCategory: "StaffChild",  motherName: "Maryan Jaamac",    phone: "+252614600006" },
  { name: "Xaawo Maxamuud Nuur",    gender: "Female", dob: dob(9),  gradeIndex: 2, feeCategory: "Regular",     motherName: "Caasho Nuur",      phone: "+252614600007" },
  { name: "Cabdiraxmaan Siyaad",    gender: "Male",   dob: dob(9),  gradeIndex: 2, feeCategory: "Regular",     motherName: "Hibo Siyaad",      phone: "+252614600008" },
  { name: "Ibtisaam Daahir Cismaan",gender: "Female", dob: dob(9),  gradeIndex: 2, feeCategory: "Orphan",      motherName: "Luul Cismaan",     phone: "+252614600009" },
  { name: "Guuleed Axmed Garaane",  gender: "Male",   dob: dob(10), gradeIndex: 3, feeCategory: "Regular",     motherName: "Caasha Garaane",   phone: "+252614600010" },
  { name: "Nasra Xasan Cadde",      gender: "Female", dob: dob(10), gradeIndex: 3, feeCategory: "Regular",     motherName: "Safiyo Cadde",     phone: "+252614600011" },
  { name: "Warsan Cabdi Cigaal",    gender: "Female", dob: dob(10), gradeIndex: 3, feeCategory: "Scholarship", motherName: "Niimo Cigaal",     phone: "+252614600012", sponsorName: "Hibo Education Fund" },
  { name: "Cabdiraxmaan Faarax",    gender: "Male",   dob: dob(11), gradeIndex: 4, feeCategory: "Regular",     motherName: "Deeqa Faarax",     phone: "+252614600013" },
  { name: "Shukri Yuusuf Cafrax",   gender: "Female", dob: dob(11), gradeIndex: 4, feeCategory: "Regular",     motherName: "Caasho Cafrax",    phone: "+252614600014" },
  { name: "Daariq Bile Xaad",       gender: "Male",   dob: dob(11), gradeIndex: 4, feeCategory: "StaffChild",  motherName: "Faadumo Xaad",     phone: "+252614600015" },
  { name: "Barwaaqo Maxamed Xirsi", gender: "Female", dob: dob(12), gradeIndex: 5, feeCategory: "Regular",     motherName: "Caasha Xirsi",     phone: "+252614600016" },
  { name: "Kabaal Cali Geelle",     gender: "Male",   dob: dob(12), gradeIndex: 5, feeCategory: "Regular",     motherName: "Sahra Geelle",     phone: "+252614600017" },
  { name: "Ilwaad Jaamac Diiriye",  gender: "Female", dob: dob(13), gradeIndex: 5, feeCategory: "Orphan",      motherName: "Hinda Diiriye",    phone: "+252614600018" },
  { name: "Abuukar Iimaan Qeybdiid",gender: "Male",   dob: dob(12), gradeIndex: 5, feeCategory: "Regular",     motherName: "Maryan Qeybdiid",  phone: "+252614600019" },
  { name: "Hodan Saleebaan Rooble", gender: "Female", dob: dob(12), gradeIndex: 5, feeCategory: "Regular",     motherName: "Caasho Rooble",    phone: "+252614600020" },
];

const FEE_MAP = { "Grade 1": 120, "Grade 2": 120, "Grade 3": 130, "Grade 4": 130, "Grade 5": 140, "Grade 6": 140 };
const CURRENT_YEAR = "2025/2026";

function randomMark(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function run() {
  await connectDB();
  log("\n==============================================");
  log("  Al-Hikma Extra Seed (ADD ONLY - SAFE)");
  log("==============================================\n");

  // 1. Historical Terms (2013 - 2026)
  log("1. Seeding historical terms 2013-2026...");
  const allTermsData = buildHistoricalTerms();
  const termDocs = [];
  for (const t of allTermsData) {
    const doc = await Term.findOneAndUpdate(
      { name: t.name, academicYear: t.academicYear },
      t,
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    termDocs.push(doc);
  }
  ok(`${termDocs.length} terms ready (2013/2014 to 2025/2026)`);

  // 2. Somali Teachers
  log("2. Seeding Somali teaching faculty...");
  let teacherCount = 0;
  const teacherDocs = [];
  for (const tch of SOMALI_TEACHERS) {
    let user = await User.findOne({ email: tch.email });
    if (!user) {
      user = await User.create({
        name: tch.name,
        email: tch.email,
        password: "teacher123456",
        role: "Teacher",
        status: "Active",
        phone: tch.phone,
        employeeId: tch.employeeId,
        qualification: tch.qualification,
        specialization: tch.specialization,
        nationality: "Somali",
        contractType: "Permanent",
        joinDate: daysAgo(700),
        mustChangePassword: true,
      });
      teacherCount++;
      info(`Created Teacher: ${tch.name} (${tch.email})`);
    }
    teacherDocs.push(user);
  }
  ok(`${teacherCount} new teachers added (total faculty: ${teacherDocs.length})`);

  // 3. Classes
  const classDocs = await SchoolClass.find({ academicYear: CURRENT_YEAR }).lean();
  if (classDocs.length === 0) {
    log("ERROR: No classes found for current year. Please verify classes exist.");
    process.exit(1);
  }

  // Assign class teachers if missing
  for (let i = 0; i < classDocs.length; i++) {
    const cls = classDocs[i];
    if (!cls.classTeacher && teacherDocs[i % teacherDocs.length]) {
      await SchoolClass.findByIdAndUpdate(cls._id, {
        classTeacher: teacherDocs[i % teacherDocs.length]._id,
      });
    }
  }

  // 4. Fee structures for all terms x classes
  log("3. Seeding fee structures for terms & classes...");
  let feeCount = 0;
  for (const cls of classDocs) {
    const tuition = FEE_MAP[cls.name] || 120;
    for (const termDoc of termDocs) {
      const exists = await FeeStructure.findOne({ schoolClass: cls._id, term: termDoc._id });
      if (!exists) {
        await FeeStructure.create({
          schoolClass: cls._id,
          term: termDoc._id,
          lineItems: [
            { label: "Tuition Fee", amount: tuition },
            { label: "Activity Fee", amount: 10 },
            { label: "Library Fee", amount: 5 },
          ],
          total: tuition + 15,
        });
        feeCount++;
      }
    }
  }
  ok(`${feeCount} fee structures added`);

  // Active term and historical sample terms
  const activeTerm = termDocs.find((t) => t.isActive) || termDocs[termDocs.length - 2];
  const pastTerms = termDocs.filter((t) => !t.isActive).slice(-8);

  // 5. Somali Students & Parents
  log("4. Seeding Somali students and parent accounts...");
  let studentCount = 0;
  let invoiceCount = 0;

  for (const [idx, s] of EXTRA_STUDENTS.entries()) {
    const classDoc = classDocs[s.gradeIndex % classDocs.length];
    if (!classDoc) continue;
    const admNo = "STU2025E" + String(idx + 1).padStart(3, "0");

    const discountPercent =
      s.feeCategory === "Orphan"
        ? 100
        : s.feeCategory === "Scholarship"
        ? 100
        : s.feeCategory === "StaffChild"
        ? 50
        : 0;
    const discountReason =
      s.feeCategory === "Orphan"
        ? "Agoonimo (100% Free Tuition)"
        : s.feeCategory === "Scholarship"
        ? "Deeq Waxbarasho - " + (s.sponsorName || "Sponsor")
        : s.feeCategory === "StaffChild"
        ? "Staff Child (50% Discount)"
        : "";

    let student = await User.findOne({ admissionNo: admNo });
    if (!student) {
      student = await User.create({
        name: s.name,
        admissionNo: admNo,
        password: "student123456",
        role: "Student",
        status: "Active",
        mustChangePassword: true,
        gender: s.gender,
        dob: s.dob,
        phone: s.phone,
        schoolClass: classDoc._id,
        enrolledAt: daysAgo(365),
        enrollmentStatus: "Enrolled",
        motherName: s.motherName,
        placeOfBirth: "Mogadishu",
        address: "Mogadishu, Somalia",
        feeCategory: s.feeCategory,
        discountPercent,
        discountReason: discountReason || undefined,
        sponsorName: s.sponsorName || undefined,
        emergencyContact: { name: s.motherName, phone: s.phone, relation: "Mother" },
      });
      studentCount++;
      info(`Created Student: ${s.name} (${admNo})`);
    }

    // Somali Parent: clean email with NO DOTS ending in @gmail.com
    const parentEmail = cleanEmail(s.motherName);
    let parent = await User.findOne({ email: parentEmail });
    if (!parent) {
      parent = await User.create({
        name: s.motherName,
        email: parentEmail,
        password: "parent123456",
        role: "Parent",
        status: "Active",
        mustChangePassword: true,
        phone: s.phone,
        nationality: "Somali",
      });
      info(`Created Parent: ${s.motherName} (${parentEmail})`);
    }

    student = await User.findById(student._id);
    if (!student.guardians?.some((g) => String(g.user) === String(parent._id))) {
      student.guardians = student.guardians || [];
      student.guardians.push({ user: parent._id, relation: "Mother" });
      await student.save();
    }

    // Invoices and Payments for current and historical terms
    for (const [tIdx, term] of [activeTerm, ...pastTerms].entries()) {
      const exists = await Invoice.findOne({ student: student._id, term: term._id });
      if (exists) continue;

      const fs = await FeeStructure.findOne({ schoolClass: classDoc._id, term: term._id });
      const baseTotal = fs ? fs.total : (FEE_MAP[classDoc.name] || 120) + 15;
      let invoiceTotal = baseTotal;
      let lineItems = fs
        ? fs.lineItems.map((li) => ({ label: li.label, amount: li.amount }))
        : [
            { label: "Tuition Fee", amount: baseTotal - 15 },
            { label: "Activity Fee", amount: 10 },
            { label: "Library Fee", amount: 5 },
          ];

      if (discountPercent === 100) {
        invoiceTotal = 0;
        lineItems = lineItems.map((li) => ({ ...li, amount: 0 }));
      } else if (discountPercent > 0) {
        const factor = 1 - discountPercent / 100;
        invoiceTotal = Math.round(baseTotal * factor * 100) / 100;
        lineItems = lineItems.map((li) => ({
          ...li,
          amount: Math.round(li.amount * factor * 100) / 100,
        }));
      }

      const invoice = new Invoice({
        student: student._id,
        term: term._id,
        schoolClass: classDoc._id,
        lineItems,
        total: invoiceTotal,
        dueDate: term.endDate,
        status: invoiceTotal === 0 ? "Paid" : "Unpaid",
        amountPaid: 0,
        balance: invoiceTotal,
        payments: [],
      });

      if (tIdx > 0 && invoiceTotal > 0) {
        const rand = Math.random();
        if (rand < 0.70) {
          invoice.payments.push({
            amount: invoiceTotal,
            date: term.endDate,
            method: "evc",
            reference: `EVC-HIST-${admNo}-${tIdx}`,
            phone: s.phone,
          });
          invoice.recalculate();
        } else if (rand < 0.90) {
          const partial = Math.round((invoiceTotal / 2) * 100) / 100;
          invoice.payments.push({
            amount: partial,
            date: daysAgo(tIdx * 20),
            method: "evc",
            reference: `EVC-PART-${admNo}-${tIdx}`,
            phone: s.phone,
          });
          invoice.recalculate();
        }
      }
      await invoice.save();
      invoiceCount++;
    }
  }
  ok(`${studentCount} extra Somali students created`);
  ok(`${invoiceCount} historical and active invoices created`);

  // 6. Exams and Marks
  log("5. Seeding exams and academic marks...");
  const subjects = await Subject.find({}).lean();
  const examTypes = ["Midterm", "Final"];
  let examCount = 0;
  let markCount = 0;
  const teacherId = teacherDocs[0]._id;

  for (const cls of classDocs) {
    const studentsInClass = await User.find({
      role: "Student",
      schoolClass: cls._id,
      enrollmentStatus: "Enrolled",
    }).lean();
    if (!studentsInClass.length) continue;

    for (const examType of examTypes) {
      for (const subj of subjects.slice(0, 5)) {
        let exam = await Exam.findOne({
          schoolClass: cls._id,
          subject: subj._id,
          term: activeTerm._id,
          type: examType,
        });
        if (!exam) {
          exam = await Exam.create({
            title: `${examType} - ${subj.name}`,
            type: examType,
            schoolClass: cls._id,
            subject: subj._id,
            term: activeTerm._id,
            date: examType === "Midterm" ? daysAgo(45) : daysAgo(10),
            maxMarks: 100,
            createdBy: teacherId,
          });
          examCount++;
        }
        for (const student of studentsInClass) {
          const exists = await Mark.findOne({ exam: exam._id, student: student._id });
          if (exists) continue;
          const score = randomMark(48, 98);
          await Mark.create({
            exam: exam._id,
            student: student._id,
            score,
            remark:
              score >= 70 ? "Good performance" : score >= 50 ? "Needs improvement" : "Needs extra support",
            enteredBy: teacherId,
          });
          markCount++;
        }
      }
    }
  }
  ok(`${examCount} exams created`);
  ok(`${markCount} marks created`);

  // 7. Attendance - past 30 school days
  log("6. Seeding attendance for past 30 days...");
  const statusChoices = ["Present", "Present", "Present", "Present", "Late", "Absent"];
  let attCount = 0;

  for (const cls of classDocs) {
    const studentsInClass = await User.find({
      role: "Student",
      schoolClass: cls._id,
      enrollmentStatus: "Enrolled",
    }).lean();
    if (!studentsInClass.length) continue;

    for (let day = 1; day <= 30; day++) {
      const date = daysAgo(day);
      date.setHours(0, 0, 0, 0);
      const dow = date.getDay();
      if (dow === 0 || dow === 6) continue;

      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const exists = await Attendance.findOne({
        schoolClass: cls._id,
        date: { $gte: date, $lt: nextDay },
      });
      if (exists) continue;

      await Attendance.create({
        schoolClass: cls._id,
        term: activeTerm._id,
        date,
        markedBy: teacherId,
        records: studentsInClass.map((st) => ({
          student: st._id,
          status: statusChoices[Math.floor(Math.random() * statusChoices.length)],
        })),
      });
      attCount++;
    }
  }
  ok(`${attCount} attendance register sessions recorded`);

  // 8. Announcements
  log("7. Seeding active notices & announcements...");
  const ANNOUNCEMENTS = [
    {
      title: "Midterm Exam Results Published",
      body: "Dear parents, midterm results for Term 2 are now available in the parent portal. Please login to view your child's progress report.",
      priority: "Important",
      category: "Exams",
      isPinned: true,
      audience: "All",
      isPublic: true,
      createdBy: teacherId,
    },
    {
      title: "School Fee Deadline Reminder",
      body: "Reminder: Term 2 school fees must be paid before the end of this month. Please visit the school office or pay via EVC Plus.",
      priority: "Urgent",
      category: "Fees",
      isPinned: true,
      audience: "All",
      isPublic: false,
      createdBy: teacherId,
    },
    {
      title: "Annual Sports Day - 25th October",
      body: "The Annual Sports Day will be held on 25th October 2026. All students are expected to attend and wear sports attire.",
      priority: "Normal",
      category: "Events",
      isPinned: false,
      audience: "All",
      isPublic: true,
      createdBy: teacherId,
    },
    {
      title: "Parent-Teacher Meeting",
      body: "A parent-teacher meeting is scheduled for 30th October 2026 at 9:00 AM. Parents are kindly requested to attend and discuss student progress.",
      priority: "Important",
      category: "General",
      isPinned: false,
      audience: "All",
      isPublic: true,
      createdBy: teacherId,
    },
    {
      title: "Quran Memorisation Competition",
      body: "Al-Hikma School will host its annual Quran Memorisation Competition on 5th November 2026. Students may register with their teacher.",
      priority: "Normal",
      category: "Events",
      isPinned: false,
      audience: "All",
      isPublic: true,
      createdBy: teacherId,
    },
  ];
  let annCount = 0;
  for (const a of ANNOUNCEMENTS) {
    const exists = await Announcement.findOne({ title: a.title });
    if (!exists) {
      await Announcement.create(a);
      annCount++;
    }
  }
  ok(`${annCount} announcements created`);

  log("\n==============================================");
  log("  Al-Hikma Extra Seed Completed Successfully!");
  log("==============================================");
  log(`  Terms:         ${termDocs.length} (2013/2014 to 2025/2026)`);
  log(`  Teachers:      ${teacherCount} added (Somali)`);
  log(`  Students:      ${studentCount} extra added (Somali)`);
  log(`  Invoices:      ${invoiceCount} created with payment history`);
  log(`  Exams:         ${examCount} created`);
  log(`  Marks:         ${markCount} created`);
  log(`  Attendance:    ${attCount} class sessions`);
  log(`  Announcements: ${annCount} created`);
  log("==============================================\n");

  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("seed2 error: " + err.message);
  if (err.stack) console.error(err.stack);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
