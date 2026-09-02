import "dotenv/config";
import "colors";
import mongoose from "mongoose";
import connectDB from "../config/db.js";

import User from "../models/userModel.js";
import Subject from "../models/subjectModel.js";
import SchoolClass from "../models/schoolClassModel.js";
import Term from "../models/termModel.js";
import TeachingAssignment from "../models/teachingAssignmentModel.js";
import Timetable from "../models/timetableModel.js";
import Attendance from "../models/attendanceModel.js";
import Exam from "../models/examModel.js";
import Mark from "../models/markModel.js";
import FeeStructure from "../models/feeStructureModel.js";
import Invoice from "../models/invoiceModel.js";
import Announcement from "../models/announcementModel.js";
import ReportCard from "../models/reportCardModel.js";
import Notification from "../models/notificationModel.js";
import Settings from "../models/settingsModel.js";
import { computeForClassTerm } from "../controllers/reportCardController.js";
import { startOfDayUTC } from "../utils/dates.js";

// additive demo data. everything demo carries a marker so it can be removed
// cleanly: users have an @demo.school email or a D- admission number.
const YEAR = "2025/2026";
const DEMO_EMAIL = /@demo\.school$/;
const DEMO_ADM = /^D-/;

const destroy = process.argv.includes("-d") || process.argv.includes("--destroy");

async function upsertUser(where, data) {
  const found = await User.findOne(where);
  if (found) return found;
  return User.create(data);
}

async function seedDemo() {
  // subjects
  const subjectDefs = [
    ["Mathematics", "MATH"],
    ["English", "ENG"],
    ["Somali", "SOM"],
    ["Quran", "QUR"],
    ["Islamic Studies", "ISL"],
    ["Science", "SCI"],
  ];
  const subjects = {};
  for (const [name, code] of subjectDefs) {
    subjects[code] =
      (await Subject.findOne({ code })) || (await Subject.create({ name, code, gradeLevel: "Primary" }));
  }

  // term
  let term = await Term.findOne({ name: "Term 1", academicYear: YEAR });
  if (!term) {
    term = await Term.create({
      name: "Term 1",
      academicYear: YEAR,
      startDate: new Date("2025-09-01"),
      endDate: new Date("2025-12-15"),
      isActive: !(await Term.findOne({ isActive: true })),
    });
  }

  // teachers
  const teacherNames = ["Maryan Cabdi", "Faarax Aweys", "Hodan Nuur", "Cabdi Warsame", "Sagal Yusuf"];
  const teachers = [];
  for (let i = 0; i < teacherNames.length; i += 1) {
    const email = `teacher${i + 1}@demo.school`;
    teachers.push(
      await upsertUser(
        { email },
        {
          name: teacherNames[i],
          email,
          password: "teacher123",
          role: "Teacher",
          status: "Active",
          mustChangePassword: false,
          phone: `+25261${1000000 + i}`,
        }
      )
    );
  }

  // classes
  const classDefs = [
    ["Grade 3", "A", ["MATH", "ENG", "SOM", "QUR", "ISL"]],
    ["Grade 4", "A", ["MATH", "ENG", "SOM", "QUR", "SCI"]],
    ["Grade 5", "A", ["MATH", "ENG", "SOM", "ISL", "SCI"]],
  ];
  const classes = [];
  for (let i = 0; i < classDefs.length; i += 1) {
    const [name, section, codes] = classDefs[i];
    let cls = await SchoolClass.findOne({ name, section, academicYear: YEAR });
    if (!cls) {
      cls = await SchoolClass.create({
        name,
        section,
        academicYear: YEAR,
        classTeacher: teachers[i]._id,
        subjects: codes.map((c) => subjects[c]._id),
        capacity: 25,
      });
    }
    classes.push(cls);
  }

  // teaching assignments: each class teacher teaches math and english there
  for (let i = 0; i < classes.length; i += 1) {
    for (const code of ["MATH", "ENG"]) {
      const where = { teacher: teachers[i]._id, schoolClass: classes[i]._id, subject: subjects[code]._id };
      if (!(await TeachingAssignment.findOne(where))) {
        await TeachingAssignment.create({ ...where, academicYear: YEAR });
      }
    }
  }

  // parents
  const parentNames = ["Xasan Cali", "Aamina Maxamed", "Cumar Ibrahim", "Faadumo Warsame", "Yusuf Aden", "Khadra Nuur"];
  const parents = [];
  for (let i = 0; i < parentNames.length; i += 1) {
    const email = `parent${i + 1}@demo.school`;
    parents.push(
      await upsertUser(
        { email },
        {
          name: parentNames[i],
          email,
          password: "parent123",
          role: "Parent",
          status: "Active",
          mustChangePassword: false,
          phone: `+25262${2000000 + i}`,
        }
      )
    );
  }

  // students
  const firstNames = ["Ayaan", "Bilan", "Khadar", "Layla", "Maxamed", "Nasteexo", "Cabdiraxmaan", "Sahra", "Ismaaciil", "Ruweyda", "Daahir", "Hamdi", "Yaasiin", "Iqra", "Cabdullaahi"];
  const students = [];
  for (let i = 0; i < firstNames.length; i += 1) {
    const admissionNo = `D-${String(i + 1).padStart(3, "0")}`;
    let student = await User.findOne({ admissionNo });
    if (!student) {
      const cls = classes[i % classes.length];
      student = await User.create({
        name: `${firstNames[i]} ${parentNames[i % parentNames.length].split(" ")[0]}`,
        admissionNo,
        password: "student123",
        role: "Student",
        status: "Active",
        mustChangePassword: false,
        gender: i % 2 === 0 ? "Male" : "Female",
        dob: new Date(2013 + (i % 3), i % 12, (i % 27) + 1),
        schoolClass: cls._id,
        enrolledAt: new Date("2025-09-01"),
        enrollmentStatus: "Enrolled",
        guardians: [{ user: parents[i % parents.length]._id, relation: i % 2 === 0 ? "Father" : "Mother" }],
      });
    }
    students.push(student);
  }

  // timetable for the first class
  const cls0 = classes[0];
  if (!(await Timetable.findOne({ schoolClass: cls0._id, academicYear: YEAR }))) {
    await Timetable.create({
      schoolClass: cls0._id,
      academicYear: YEAR,
      entries: [
        { day: "Saturday", period: 1, startTime: "08:00", endTime: "08:45", subject: subjects.MATH._id, teacher: teachers[0]._id },
        { day: "Saturday", period: 2, startTime: "08:45", endTime: "09:30", subject: subjects.ENG._id, teacher: teachers[0]._id },
        { day: "Sunday", period: 1, startTime: "08:00", endTime: "08:45", subject: subjects.QUR._id, teacher: teachers[1]._id },
      ],
    });
  }

  // attendance: two days per class
  for (const cls of classes) {
    const roster = students.filter((s) => String(s.schoolClass) === String(cls._id));
    for (const dayStr of ["2025-09-08", "2025-09-09"]) {
      const date = startOfDayUTC(dayStr);
      if (await Attendance.findOne({ schoolClass: cls._id, date })) continue;
      await Attendance.create({
        date,
        schoolClass: cls._id,
        term: term._id,
        markedBy: cls.classTeacher,
        records: roster.map((s, idx) => ({
          student: s._id,
          status: idx % 7 === 0 ? "Absent" : idx % 5 === 0 ? "Late" : "Present",
        })),
      });
    }
  }

  // exams + marks for math and english in each class
  for (const cls of classes) {
    const roster = students.filter((s) => String(s.schoolClass) === String(cls._id));
    for (const code of ["MATH", "ENG"]) {
      let exam = await Exam.findOne({ schoolClass: cls._id, subject: subjects[code]._id, term: term._id, title: `${code} Quiz 1` });
      if (!exam) {
        exam = await Exam.create({
          title: `${code} Quiz 1`,
          type: "Quiz",
          schoolClass: cls._id,
          subject: subjects[code]._id,
          term: term._id,
          maxMarks: 20,
          date: new Date("2025-10-10"),
          createdBy: cls.classTeacher,
        });
      }
      for (let i = 0; i < roster.length; i += 1) {
        const where = { exam: exam._id, student: roster[i]._id };
        if (!(await Mark.findOne(where))) {
          await Mark.create({ ...where, score: 8 + ((i * 3 + code.length) % 12), enteredBy: cls.classTeacher });
        }
      }
    }
  }

  // report cards
  for (const cls of classes) {
    await computeForClassTerm(cls._id, term._id);
  }
  // publish the first class's cards
  await ReportCard.updateMany({ schoolClass: cls0._id, term: term._id }, { $set: { published: true } });

  // fee structures + invoices + some payments
  for (const cls of classes) {
    let fs = await FeeStructure.findOne({ schoolClass: cls._id, term: term._id });
    if (!fs) {
      fs = await FeeStructure.create({
        schoolClass: cls._id,
        term: term._id,
        lineItems: [
          { label: "Tuition", amount: 80 },
          { label: "Transport", amount: 15 },
          { label: "Books", amount: 5 },
        ],
      });
    }
    const roster = students.filter((s) => String(s.schoolClass) === String(cls._id));
    for (let i = 0; i < roster.length; i += 1) {
      const s = roster[i];
      if (await Invoice.findOne({ student: s._id, term: term._id })) continue;
      const inv = await Invoice.create({
        student: s._id,
        term: term._id,
        schoolClass: cls._id,
        lineItems: fs.lineItems.map((li) => ({ label: li.label, amount: li.amount })),
        total: fs.total,
        dueDate: term.endDate,
        balance: fs.total,
      });
      if (i % 3 === 0) {
        inv.payments.push({ amount: fs.total, method: "cash", reference: `DEMO-CASH-${s.admissionNo}` });
      } else if (i % 3 === 1) {
        inv.payments.push({ amount: 50, method: "evc", reference: `DEMO-EVC-${s.admissionNo}`, phone: "+252615550000" });
      }
      inv.recalculate();
      await inv.save();
    }
  }

  // announcements
  if (!(await Announcement.findOne({ title: "Welcome to Term 1" }))) {
    await Announcement.create({
      title: "Welcome to Term 1",
      body: "Classes resume on Saturday. We look forward to a great term.",
      audience: "All",
      isPublic: true,
      createdBy: (await User.findOne({ role: "Admin" }))?._id,
    });
  }
  if (!(await Announcement.findOne({ title: "Grade 3 reading week" }))) {
    await Announcement.create({
      title: "Grade 3 reading week",
      body: "Please send a story book with your child this week.",
      audience: "Class",
      schoolClass: cls0._id,
      createdBy: cls0.classTeacher,
    });
  }

  // let the seeded admin log straight in while demoing
  await User.updateOne({ role: "Admin" }, { $set: { mustChangePassword: false } });

  // public school profile used by the header, footer and public pages.
  // only fills a fresh document so a real admin edit is never overwritten.
  await Settings.updateOne(
    { key: "school" },
    {
      $setOnInsert: {
        key: "school",
        schoolName: "Al Nuur Academy",
        tagline: "Primary, secondary, Quran and Islamic studies",
        address: "KM4, Mogadishu, Somalia",
        phone: "+252 61 915 7381",
        email: "info@alnuur.example",
        currency: "USD",
        socials: {
          facebook: "https://facebook.com/alnuur",
          instagram: "",
          whatsapp: "https://wa.me/252619157381",
        },
      },
    },
    { upsert: true }
  );

  console.log(
    `demo data ready: ${teachers.length} teachers, ${parents.length} parents, ${students.length} students, ${classes.length} classes`
      .green
  );
}

async function destroyDemo() {
  const demoUsers = await User.find({
    $or: [{ email: DEMO_EMAIL }, { admissionNo: DEMO_ADM }],
  }).select("_id");
  const ids = demoUsers.map((u) => u._id);

  await Promise.all([
    Mark.deleteMany({ student: { $in: ids } }),
    ReportCard.deleteMany({ student: { $in: ids } }),
    Invoice.deleteMany({ student: { $in: ids } }),
    Attendance.updateMany({}, { $pull: { records: { student: { $in: ids } } } }),
    TeachingAssignment.deleteMany({ teacher: { $in: ids } }),
    Notification.deleteMany({ to: { $in: ids } }),
  ]);

  // demo classes / term / structures / exams tied to the demo year
  const demoClasses = await SchoolClass.find({ academicYear: YEAR }).select("_id");
  const classIds = demoClasses.map((c) => c._id);
  await Promise.all([
    Timetable.deleteMany({ schoolClass: { $in: classIds } }),
    Attendance.deleteMany({ schoolClass: { $in: classIds } }),
    Exam.deleteMany({ schoolClass: { $in: classIds } }),
    FeeStructure.deleteMany({ schoolClass: { $in: classIds } }),
    Invoice.deleteMany({ schoolClass: { $in: classIds } }),
    Announcement.deleteMany({ title: { $in: ["Welcome to Term 1", "Grade 3 reading week"] } }),
  ]);
  await SchoolClass.deleteMany({ academicYear: YEAR });
  await Term.deleteMany({ academicYear: YEAR });
  await Subject.deleteMany({ code: { $in: ["MATH", "ENG", "SOM", "QUR", "ISL", "SCI"] } });
  await User.deleteMany({ _id: { $in: ids } });

  console.log(`removed ${ids.length} demo users and their demo data`.yellow);
}

async function run() {
  await connectDB();
  if (destroy) await destroyDemo();
  else await seedDemo();
  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error(String(err.stack || err.message).red);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
