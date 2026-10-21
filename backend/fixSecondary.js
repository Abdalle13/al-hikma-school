/**
 * Al-Hikma School - Switch from Kindergarten to Secondary (Form 1 - Form 4)
 *
 * 1. Remove "Kindergarten"
 * 2. Add Form 1 A, Form 2 A, Form 3 A, Form 4 A (Secondary)
 * 3. Re-balance students across all 12 classes (Grade 1 - 8 & Form 1 - 4)
 * 4. Add FeeStructures, Invoices, Exams, Marks, and Attendance for Secondary classes
 * 5. Update any Kindergarten applications to Grade 1 or Form 1
 */

import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import User from "./models/userModel.js";
import SchoolClass from "./models/schoolClassModel.js";
import Subject from "./models/subjectModel.js";
import Term from "./models/termModel.js";
import FeeStructure from "./models/feeStructureModel.js";
import Exam from "./models/examModel.js";
import Mark from "./models/markModel.js";
import Attendance from "./models/attendanceModel.js";
import Application from "./models/applicationModel.js";

const CURRENT_YEAR = "2025/2026";

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function randomMark(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const SECONDARY_CLASSES = [
  { name: "Form 1", section: "A", capacity: 40 },
  { name: "Form 2", section: "A", capacity: 40 },
  { name: "Form 3", section: "A", capacity: 40 },
  { name: "Form 4", section: "A", capacity: 40 },
];

async function run() {
  await connectDB();
  console.log("\n=== Transitioning to Full Primary (Grade 1-8) & Secondary (Form 1-4) ===\n");

  const teachers = await User.find({ role: "Teacher", status: "Active" });
  const subjects = await Subject.find({});
  const allSubjectIds = subjects.map((s) => s._id);

  // 1. Remove Kindergarten and create Form 1 first as fallback
  let form1 = await SchoolClass.findOne({ name: "Form 1", academicYear: CURRENT_YEAR });
  if (!form1) {
    form1 = await SchoolClass.create({
      name: "Form 1",
      section: "A",
      academicYear: CURRENT_YEAR,
      capacity: 40,
      classTeacher: teachers[0]?._id,
      subjects: allSubjectIds,
    });
    console.log("Created Class: Form 1 A");
  }

  const kgClass = await SchoolClass.findOne({
    name: { $regex: /kindergarten|kg/i },
    academicYear: CURRENT_YEAR,
  });

  if (kgClass) {
    // Reassign any students in KG to Form 1 or Grade 1
    const grade1 = await SchoolClass.findOne({ name: "Grade 1", academicYear: CURRENT_YEAR });
    const targetClass = grade1 || form1;
    await User.updateMany(
      { schoolClass: kgClass._id },
      { $set: { schoolClass: targetClass._id } }
    );
    // Remove KG attendance and exams
    await Attendance.deleteMany({ schoolClass: kgClass._id });
    await Exam.deleteMany({ schoolClass: kgClass._id });
    await FeeStructure.deleteMany({ schoolClass: kgClass._id });
    await SchoolClass.deleteOne({ _id: kgClass._id });
    console.log("Successfully removed Kindergarten class and transferred students.");
  }

  // Update applications mentioning Kindergarten
  await Application.updateMany(
    { gradeApplyingFor: { $regex: /kindergarten|kg/i } },
    { $set: { gradeApplyingFor: "Grade 1" } }
  );

  // 2. Ensure all 4 Secondary classes exist
  for (let i = 0; i < SECONDARY_CLASSES.length; i++) {
    const sc = SECONDARY_CLASSES[i];
    let cls = await SchoolClass.findOne({ name: sc.name, academicYear: CURRENT_YEAR });
    const teacher = teachers[(i + 4) % teachers.length]?._id;
    if (!cls) {
      cls = await SchoolClass.create({
        name: sc.name,
        section: sc.section,
        academicYear: CURRENT_YEAR,
        capacity: sc.capacity,
        classTeacher: teacher,
        subjects: allSubjectIds,
      });
      console.log(`Created Secondary Class: ${sc.name} ${sc.section}`);
    } else {
      cls.subjects = allSubjectIds;
      if (!cls.classTeacher && teacher) cls.classTeacher = teacher;
      await cls.save();
    }
  }

  // 3. Get all active classes (should now be Grade 1-8 and Form 1-4 = 12 classes)
  const allClasses = await SchoolClass.find({ academicYear: CURRENT_YEAR }).sort({ name: 1 });
  console.log(`\nActive Classes (${allClasses.length}):`, allClasses.map((c) => `${c.name} ${c.section || ""}`));

  // 4. Distribute students evenly across all 12 classes
  const students = await User.find({ role: "Student", enrollmentStatus: "Enrolled" });
  for (let i = 0; i < students.length; i++) {
    const targetClass = allClasses[i % allClasses.length];
    await User.findByIdAndUpdate(students[i]._id, { schoolClass: targetClass._id });
  }
  console.log(`Distributed ${students.length} students across all ${allClasses.length} classes.`);

  // 5. Terms
  const terms = await Term.find({ academicYear: CURRENT_YEAR });
  const activeTerm = terms.find((t) => t.isActive) || terms[0];

  // 6. Fee structures for all classes
  let feeCount = 0;
  for (const cls of allClasses) {
    for (const term of terms) {
      const exists = await FeeStructure.findOne({ schoolClass: cls._id, term: term._id });
      if (!exists) {
        const tuition = cls.name.startsWith("Form") ? 150 : 130;
        await FeeStructure.create({
          schoolClass: cls._id,
          term: term._id,
          lineItems: [
            { label: "Tuition Fee", amount: tuition },
            { label: "Activity Fee", amount: 15 },
            { label: "Lab & Library Fee", amount: 15 },
          ],
          total: tuition + 30,
        });
        feeCount++;
      }
    }
  }
  console.log(`Added ${feeCount} fee structures.`);

  // 7. Attendance for all classes
  const statusChoices = ["Present", "Present", "Present", "Present", "Late", "Absent"];
  let attCount = 0;
  for (const cls of allClasses) {
    const classStudents = await User.find({ role: "Student", schoolClass: cls._id, enrollmentStatus: "Enrolled" }).lean();
    if (!classStudents.length) continue;

    for (let day = 1; day <= 20; day++) {
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
          markedBy: cls.classTeacher || teachers[0]._id,
          records: classStudents.map((st) => ({
            student: st._id,
            status: statusChoices[Math.floor(Math.random() * statusChoices.length)],
          })),
        });
        attCount++;
      }
    }
  }
  console.log(`Added ${attCount} attendance records.`);

  // 8. Exams and marks for secondary classes
  const examTypes = ["Midterm", "Final"];
  let examCount = 0;
  let markCount = 0;
  for (const cls of allClasses) {
    const classStudents = await User.find({ role: "Student", schoolClass: cls._id, enrollmentStatus: "Enrolled" }).lean();
    if (!classStudents.length) continue;

    for (const examType of examTypes) {
      for (const subj of subjects.slice(0, 5)) {
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
            createdBy: cls.classTeacher || teachers[0]._id,
          });
          examCount++;
        }
        for (const st of classStudents) {
          const exists = await Mark.findOne({ exam: exam._id, student: st._id });
          if (!exists) {
            const score = randomMark(55, 98);
            await Mark.create({
              exam: exam._id,
              student: st._id,
              score,
              remark: score >= 75 ? "Excellent" : score >= 50 ? "Pass" : "Needs support",
              enteredBy: cls.classTeacher || teachers[0]._id,
            });
            markCount++;
          }
        }
      }
    }
  }
  console.log(`Added ${examCount} exams and ${markCount} marks.`);

  console.log("\n=== Transition to Secondary Completed Successfully! ===");
  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("fixSecondary error: " + err.message);
  if (err.stack) console.error(err.stack);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
