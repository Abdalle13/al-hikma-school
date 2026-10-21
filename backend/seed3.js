/**
 * Al-Hikma School - Comprehensive Full Expansion Seed Script (ADD ONLY)
 *
 * Populates:
 * 1. Full Class Spectrum: KG, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5, Grade 6, Grade 7, Grade 8
 * 2. Full Subjects: Math, English, Somali, Quran, Islamic Studies, Science, Arabic, Social Studies, ICT, Tarbiya, PE
 * 3. Class Teacher & Subject Linking
 * 4. Admission Applications (Admissions page in Admin will now show real applications!)
 * 5. Student re-distribution across all grades so no grade is empty
 * 6. Daily Attendance across all classes for past 30 school days
 * 7. Fee structures & Invoices for all classes & terms
 * 8. Exams & Marks for all classes
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
import Application from "./models/applicationModel.js";

const log  = (m) => console.log(m);
const ok   = (m) => console.log("  [OK]  " + m);
const info = (m) => console.log("  [->]  " + m);

const CURRENT_YEAR = "2025/2026";

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function randomMark(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const ALL_CLASSES = [
  { name: "Kindergarten", section: "A", capacity: 30 },
  { name: "Grade 1", section: "A", capacity: 35 },
  { name: "Grade 2", section: "A", capacity: 35 },
  { name: "Grade 3", section: "A", capacity: 40 },
  { name: "Grade 4", section: "A", capacity: 40 },
  { name: "Grade 5", section: "A", capacity: 40 },
  { name: "Grade 6", section: "A", capacity: 40 },
  { name: "Grade 7", section: "A", capacity: 40 },
  { name: "Grade 8", section: "A", capacity: 40 },
];

const ALL_SUBJECTS = [
  { name: "Mathematics", code: "MTH101", department: "Mathematics", periodsPerWeek: 5 },
  { name: "English Language", code: "ENG101", department: "Languages", periodsPerWeek: 5 },
  { name: "Somali Language", code: "SOM101", department: "Languages", periodsPerWeek: 4 },
  { name: "Holy Quran & Tajweed", code: "QRN101", department: "Islamic Studies", periodsPerWeek: 5 },
  { name: "Islamic Studies", code: "ISL101", department: "Islamic Studies", periodsPerWeek: 4 },
  { name: "General Science", code: "SCI101", department: "Sciences", periodsPerWeek: 4 },
  { name: "Arabic Language", code: "ARB101", department: "Languages", periodsPerWeek: 4 },
  { name: "Social Studies & History", code: "SOC101", department: "Humanities", periodsPerWeek: 3 },
  { name: "Computer Studies & ICT", code: "ICT101", department: "Technology", periodsPerWeek: 2 },
  { name: "Tarbiya & Akhlaaq", code: "TAR101", department: "Islamic Studies", periodsPerWeek: 2 },
  { name: "Physical Education", code: "PHE101", department: "Sports", periodsPerWeek: 2 },
];

const APPLICATIONS_DATA = [
  {
    childName: "Ayaan Maxamed Nuur",
    dob: daysAgo(365 * 6),
    gender: "Female",
    motherName: "Muna Cabdiraxmaan",
    parentName: "Muna Cabdiraxmaan Warsame",
    relationship: "Mother",
    parentPhone: "+252615990001",
    parentEmail: "munawarsame@gmail.com",
    gradeApplyingFor: "Grade 1",
    previousSchool: "Al-Bayaan Kindergarten",
    status: "New",
    message: "Waxaan codsanaynaa in gabadhayda loo ogolaado fasalka 1aad, waxay dhamaysatay barashada xarfaha.",
  },
  {
    childName: "Khaalid Axmed Cumar",
    dob: daysAgo(365 * 7),
    gender: "Male",
    motherName: "Deeqa Xuseen",
    parentName: "Axmed Cumar Diiriye",
    relationship: "Father",
    parentPhone: "+252615990002",
    parentEmail: "axmeddiiriye@gmail.com",
    gradeApplyingFor: "Grade 2",
    previousSchool: "Imam Shafi School",
    status: "Reviewing",
    reviewNote: "Waxaa la sugayaa shahaadadii fasalka 1aad.",
    message: "Waxaan dhawaan usoo guurnay degmada Hodan, codsi wareejin arday.",
  },
  {
    childName: "Nimco Cabdi Geelle",
    dob: daysAgo(365 * 9),
    gender: "Female",
    motherName: "Sahra Cali",
    parentName: "Deeqa Xasan Geelle",
    relationship: "Mother",
    parentPhone: "+252615990003",
    parentEmail: "deeqageelle@gmail.com",
    gradeApplyingFor: "Grade 4",
    status: "Accepted",
    reviewNote: "Imtixaanka qorista iyo xisaabta 89% ayay ka keentay. Boos baa loo hayaa.",
    message: "Ardayad dadaal badan oo jecel akhriska.",
  },
  {
    childName: "Saalax Cali Maxamuud",
    dob: daysAgo(365 * 8),
    gender: "Male",
    motherName: "Faadumo Axmed",
    parentName: "Cali Maxamuud Garaad",
    relationship: "Father",
    parentPhone: "+252615990004",
    parentEmail: "caligaraad@gmail.com",
    gradeApplyingFor: "Grade 3",
    previousSchool: "Al-Najax Primary School",
    status: "Accepted",
    reviewNote: "Dhammaan dukumiintiyadii waa la hubiyay.",
    message: "Fadlan noo soo sheega xilliga lebiska dugsiga la qaadanayo.",
  },
  {
    childName: "Zakaraye Xasan Rooble",
    dob: daysAgo(365 * 10),
    gender: "Male",
    motherName: "Caasho Nuur",
    parentName: "Sahra Ibraahim Rooble",
    relationship: "Mother",
    parentPhone: "+252615990005",
    parentEmail: "sahrarooble@gmail.com",
    gradeApplyingFor: "Grade 5",
    status: "New",
    message: "Arday Qur'aanka 15 jis xafidsan, codsi boos fasalka 5aad.",
  },
  {
    childName: "Yasmiin Bashiir Cismaan",
    dob: daysAgo(365 * 11),
    gender: "Female",
    motherName: "Xaliimo Jaamac",
    parentName: "Xaliimo Jaamac Cismaan",
    relationship: "Mother",
    parentPhone: "+252615990006",
    parentEmail: "xaliimocismaan@gmail.com",
    gradeApplyingFor: "Grade 6",
    status: "Reviewing",
    reviewNote: "Wareysi ayaa lagu wargaliyay waalidka maalinta sabtida.",
    message: "Codsi boos fasalka 6aad.",
  },
  {
    childName: "Hamza Yuusuf Faarax",
    dob: daysAgo(365 * 12),
    gender: "Male",
    motherName: "Hodan Shire",
    parentName: "Yuusuf Faarax Cilmi",
    relationship: "Father",
    parentPhone: "+252615990007",
    parentEmail: "yuusuffaarax@gmail.com",
    gradeApplyingFor: "Grade 7",
    status: "New",
    message: "Codsi boos fasalka 7aad.",
  },
  {
    childName: "Safiya Cabdi Shire",
    dob: daysAgo(365 * 5),
    gender: "Female",
    motherName: "Faadumo Maxamed",
    parentName: "Faadumo Maxamed Shire",
    relationship: "Mother",
    parentPhone: "+252615990008",
    parentEmail: "faadumoshire@gmail.com",
    gradeApplyingFor: "Kindergarten",
    status: "Accepted",
    reviewNote: "Booska KG waa loo xaqiijiyay.",
    message: "Gabadhu waa 5 jir, KG ayaan u codsanaynaa.",
  },
];

async function run() {
  await connectDB();
  log("\n==============================================");
  log("  Al-Hikma Complete Expansion (Classes, Subjects, Admissions)");
  log("==============================================\n");

  // 1. Teachers & Admin user for references
  const teachers = await User.find({ role: "Teacher", status: "Active" });
  const adminUser = await User.findOne({ role: "Admin" });
  const teacherId = teachers[0]?._id || adminUser?._id;

  // 2. Subjects
  log("1. Seeding full curriculum subjects...");
  const subjectDocs = [];
  for (const s of ALL_SUBJECTS) {
    let sub = await Subject.findOne({ name: s.name });
    if (!sub) {
      sub = await Subject.findOne({ code: s.code });
    }
    if (!sub) {
      sub = await Subject.create({
        ...s,
        totalMarks: 100,
        passMarks: 50,
      });
      info(`Created Subject: ${s.name} (${s.code})`);
    }
    subjectDocs.push(sub);
  }
  ok(`${subjectDocs.length} curriculum subjects ready`);

  // 3. Classes (KG through Grade 8)
  log("2. Seeding full spectrum of school classes (KG - Grade 8)...");
  const classDocs = [];
  for (let i = 0; i < ALL_CLASSES.length; i++) {
    const c = ALL_CLASSES[i];
    let cls = await SchoolClass.findOne({ name: c.name, academicYear: CURRENT_YEAR });
    const assignedTeacher = teachers[i % teachers.length]?._id;
    const allSubjectIds = subjectDocs.map((s) => s._id);

    if (!cls) {
      cls = await SchoolClass.create({
        name: c.name,
        section: c.section,
        academicYear: CURRENT_YEAR,
        capacity: c.capacity,
        classTeacher: assignedTeacher,
        subjects: allSubjectIds,
      });
      info(`Created Class: ${c.name} ${c.section}`);
    } else {
      cls.subjects = allSubjectIds;
      if (!cls.classTeacher && assignedTeacher) {
        cls.classTeacher = assignedTeacher;
      }
      await cls.save();
    }
    classDocs.push(cls);
  }
  ok(`${classDocs.length} classes active (KG to Grade 8)`);

  // 4. Distribute existing students evenly across all classes
  log("3. Balancing student enrolments across all classes...");
  const students = await User.find({ role: "Student", enrollmentStatus: "Enrolled" });
  for (let i = 0; i < students.length; i++) {
    const targetClass = classDocs[i % classDocs.length];
    await User.findByIdAndUpdate(students[i]._id, { schoolClass: targetClass._id });
  }
  ok(`${students.length} students distributed across ${classDocs.length} classes`);

  // 5. Terms
  const terms = await Term.find({ academicYear: CURRENT_YEAR });
  const activeTerm = terms.find((t) => t.isActive) || terms[0];

  // 6. Fee Structures for all classes
  log("4. Setting up fee structures for all classes...");
  let feeCount = 0;
  for (const cls of classDocs) {
    for (const term of terms) {
      const exists = await FeeStructure.findOne({ schoolClass: cls._id, term: term._id });
      if (!exists) {
        const tuition = cls.name.includes("KG") || cls.name.includes("Kindergarten") ? 100 : 130;
        await FeeStructure.create({
          schoolClass: cls._id,
          term: term._id,
          lineItems: [
            { label: "Tuition Fee", amount: tuition },
            { label: "Activity Fee", amount: 10 },
            { label: "Library & Materials Fee", amount: 10 },
          ],
          total: tuition + 20,
        });
        feeCount++;
      }
    }
  }
  ok(`${feeCount} fee structures added`);

  // 7. Applications (Admissions)
  log("5. Seeding realistic admission applications...");
  let appCount = 0;
  for (const a of APPLICATIONS_DATA) {
    const exists = await Application.findOne({ childName: a.childName, parentPhone: a.parentPhone });
    if (!exists) {
      await Application.create({
        ...a,
        reviewedBy: a.status !== "New" ? adminUser?._id : undefined,
      });
      appCount++;
      info(`Created Application: ${a.childName} (${a.status})`);
    }
  }
  ok(`${appCount} admission applications seeded`);

  // 8. Daily Attendance across all classes for past 30 school days
  log("6. Recording daily attendance across all classes...");
  const statusChoices = ["Present", "Present", "Present", "Present", "Late", "Absent"];
  let attCount = 0;

  for (const cls of classDocs) {
    const classStudents = await User.find({ role: "Student", schoolClass: cls._id, enrollmentStatus: "Enrolled" }).lean();
    if (!classStudents.length) continue;

    for (let day = 1; day <= 25; day++) {
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
      if (!exists) {
        await Attendance.create({
          schoolClass: cls._id,
          term: activeTerm?._id,
          date,
          markedBy: cls.classTeacher || teacherId,
          records: classStudents.map((st) => ({
            student: st._id,
            status: statusChoices[Math.floor(Math.random() * statusChoices.length)],
          })),
        });
        attCount++;
      }
    }
  }
  ok(`${attCount} class attendance register records created`);

  // 9. Exams & Marks for all classes
  log("7. Generating midterm & final exams for all classes...");
  let examCount = 0;
  let markCount = 0;
  const examTypes = ["Midterm", "Final"];

  for (const cls of classDocs) {
    const classStudents = await User.find({ role: "Student", schoolClass: cls._id, enrollmentStatus: "Enrolled" }).lean();
    if (!classStudents.length) continue;

    for (const examType of examTypes) {
      for (const subj of subjectDocs.slice(0, 5)) {
        let exam = await Exam.findOne({
          schoolClass: cls._id,
          subject: subj._id,
          term: activeTerm?._id,
          type: examType,
        });
        if (!exam) {
          exam = await Exam.create({
            title: `${examType} - ${subj.name}`,
            type: examType,
            schoolClass: cls._id,
            subject: subj._id,
            term: activeTerm?._id,
            date: examType === "Midterm" ? daysAgo(45) : daysAgo(10),
            maxMarks: 100,
            createdBy: cls.classTeacher || teacherId,
          });
          examCount++;
        }
        for (const st of classStudents) {
          const exists = await Mark.findOne({ exam: exam._id, student: st._id });
          if (!exists) {
            const score = randomMark(52, 98);
            await Mark.create({
              exam: exam._id,
              student: st._id,
              score,
              remark: score >= 75 ? "Excellent" : score >= 50 ? "Pass" : "Needs support",
              enteredBy: cls.classTeacher || teacherId,
            });
            markCount++;
          }
        }
      }
    }
  }
  ok(`${examCount} exams created`);
  ok(`${markCount} marks recorded`);

  log("\n==============================================");
  log("  Expansion Seed Complete!");
  log(`  Classes:      ${classDocs.length} (KG through Grade 8)`);
  log(`  Subjects:     ${subjectDocs.length} subjects`);
  log(`  Applications: ${appCount} new applications`);
  log(`  Attendance:   ${attCount} attendance records`);
  log(`  Exams:        ${examCount} exams`);
  log(`  Marks:        ${markCount} marks`);
  log("==============================================\n");

  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("seed3 error: " + err.message);
  if (err.stack) console.error(err.stack);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
