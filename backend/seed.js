/**
 * Al-Hikma School – Full Database Seed Script
 *
 * Seeds:
 *   • 1 Admin
 *   • 8 Teachers (with full professional profiles)
 *   • 6 Classes  (Grade 1 – Grade 6, section A)
 *   • 10 Subjects
 *   • 3 Terms    (2025/2026 academic year)
 *   • Fee Structures per class per term
 *   • 30 Students (mix: Regular, Orphan, Scholarship, StaffChild)
 *   • 30 Parent accounts linked to students
 *   • Invoices for all students in Term 1
 *
 * Usage:
 *   node seed.js            <- seed everything (idempotent)
 *   node seed.js -d         <- destroy ALL seeded data (admin kept)
 *
 * Place this file in backend/ and run from that directory.
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
import TeachingAssignment from "./models/teachingAssignmentModel.js";

const DESTROY = process.argv.includes("-d");
const ACADEMIC_YEAR = "2025/2026";

const log = (msg) => console.log(msg);
const ok  = (msg) => console.log(`  ok  ${msg}`);
const inf = (msg) => console.log(`  ->  ${msg}`);

function ago(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}
function dob(yearsAgo) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - yearsAgo);
  return d;
}

const SUBJECTS_DATA = [
  { name: "Islamic Studies",   code: "ISL",  gradeLevel: "Primary", description: "Quranic studies and Islamic values" },
  { name: "Somali Language",   code: "SOM",  gradeLevel: "Primary", description: "Somali reading, writing and grammar" },
  { name: "Mathematics",       code: "MTH",  gradeLevel: "Primary", description: "Arithmetic, geometry and problem-solving" },
  { name: "English Language",  code: "ENG",  gradeLevel: "Primary", description: "English reading, writing and comprehension" },
  { name: "Science",           code: "SCI",  gradeLevel: "Primary", description: "General science and natural world" },
  { name: "Social Studies",    code: "SST",  gradeLevel: "Primary", description: "History, geography and civic education" },
  { name: "Arabic Language",   code: "ARB",  gradeLevel: "Primary", description: "Arabic language and grammar" },
  { name: "Physical Education",code: "PE",   gradeLevel: "Primary", description: "Sports, fitness and team activities" },
  { name: "Computer Studies",  code: "CMP",  gradeLevel: "Primary", description: "Basic computing and digital literacy" },
  { name: "Arts and Crafts",   code: "ART",  gradeLevel: "Primary", description: "Creative arts and handcraft" },
];

const CLASSES_DATA = [
  { name: "Grade 1", section: "A", capacity: 35 },
  { name: "Grade 2", section: "A", capacity: 35 },
  { name: "Grade 3", section: "A", capacity: 40 },
  { name: "Grade 4", section: "A", capacity: 40 },
  { name: "Grade 5", section: "A", capacity: 40 },
  { name: "Grade 6", section: "A", capacity: 40 },
];

const TERMS_DATA = [
  { name: "Term 1", academicYear: ACADEMIC_YEAR, startDate: new Date("2025-09-01"), endDate: new Date("2025-12-20"), isActive: false },
  { name: "Term 2", academicYear: ACADEMIC_YEAR, startDate: new Date("2026-01-10"), endDate: new Date("2026-04-15"), isActive: true  },
  { name: "Term 3", academicYear: ACADEMIC_YEAR, startDate: new Date("2026-05-01"), endDate: new Date("2026-07-31"), isActive: false },
];

const FEE_MAP = { "Grade 1":120, "Grade 2":120, "Grade 3":130, "Grade 4":130, "Grade 5":140, "Grade 6":140 };

const TEACHERS_DATA = [
  { name:"Axmed Cali Nuur",          email:"axmed.cali@alhikma.edu.so",       phone:"+252614200001", gender:"Male",   dob:dob(38), employeeId:"EMP-2021-001", qualification:"B.Ed Mathematics",            specialization:"Mathematics and Science",       nationality:"Somali", nin:"SOM-NIN-001001", joinDate:new Date("2021-09-01"), contractType:"Permanent", teacherEmergencyContact:{name:"Fadumo Axmed",    phone:"+252614200099", relation:"Wife"}    },
  { name:"Faadumo Maxamed Cali",     email:"faadumo.maxamed@alhikma.edu.so",  phone:"+252614200002", gender:"Female", dob:dob(32), employeeId:"EMP-2022-001", qualification:"B.A English Language",        specialization:"English and Somali Literature", nationality:"Somali", nin:"SOM-NIN-002002", joinDate:new Date("2022-02-01"), contractType:"Permanent", teacherEmergencyContact:{name:"Maxamed Cali",   phone:"+252614200199", relation:"Brother"} },
  { name:"Cabdullahi Ibraahin Dheere",email:"cabdullahi.ibraahin@alhikma.edu.so",phone:"+252614200003",gender:"Male", dob:dob(45), employeeId:"EMP-2020-001", qualification:"M.A Islamic Studies",         specialization:"Islamic Studies and Arabic",    nationality:"Somali", nin:"SOM-NIN-003003", joinDate:new Date("2020-09-01"), contractType:"Permanent", teacherEmergencyContact:{name:"Xuriyo Ibraahin",phone:"+252614200299", relation:"Sister"}  },
  { name:"Maryan Xasan Warsame",     email:"maryan.xasan@alhikma.edu.so",     phone:"+252614200004", gender:"Female", dob:dob(29), employeeId:"EMP-2023-001", qualification:"B.Sc Computer Science",      specialization:"Computer Studies and Maths",    nationality:"Somali", nin:"SOM-NIN-004004", joinDate:new Date("2023-01-15"), contractType:"Contract",  teacherEmergencyContact:{name:"Xasan Warsame",  phone:"+252614200399", relation:"Father"}  },
  { name:"Cumar Saleebaan Jaamac",   email:"cumar.saleebaan@alhikma.edu.so",  phone:"+252614200005", gender:"Male",   dob:dob(41), employeeId:"EMP-2019-001", qualification:"B.Ed Social Studies",         specialization:"Social Studies and PE",         nationality:"Somali", nin:"SOM-NIN-005005", joinDate:new Date("2019-09-01"), contractType:"Permanent", teacherEmergencyContact:{name:"Zaynab Saleebaan",phone:"+252614200499",relation:"Wife"}    },
  { name:"Hodan Daahir Iidow",       email:"hodan.daahir@alhikma.edu.so",     phone:"+252614200006", gender:"Female", dob:dob(34), employeeId:"EMP-2022-002", qualification:"B.Sc Biology",               specialization:"Science and Arts",              nationality:"Somali", nin:"SOM-NIN-006006", joinDate:new Date("2022-09-01"), contractType:"Permanent", teacherEmergencyContact:{name:"Daahir Iidow",   phone:"+252614200599", relation:"Father"}  },
  { name:"Bashiir Yuusuf Guure",     email:"bashiir.yuusuf@alhikma.edu.so",   phone:"+252614200007", gender:"Male",   dob:dob(37), employeeId:"EMP-2021-002", qualification:"B.A Arabic Language",        specialization:"Arabic and Islamic Studies",    nationality:"Somali", nin:"SOM-NIN-007007", joinDate:new Date("2021-03-01"), contractType:"Permanent", teacherEmergencyContact:{name:"Aisha Yuusuf",   phone:"+252614200699", relation:"Sister"}  },
  { name:"Ifrah Nuur Osman",         email:"ifrah.nuur@alhikma.edu.so",       phone:"+252614200008", gender:"Female", dob:dob(26), employeeId:"EMP-2024-001", qualification:"B.Ed Primary Education",     specialization:"Grade 1 and 2 Class Teacher",  nationality:"Somali", nin:"SOM-NIN-008008", joinDate:new Date("2024-09-01"), contractType:"Contract",  teacherEmergencyContact:{name:"Nuur Osman",     phone:"+252614200799", relation:"Father"}  },
];

const STUDENT_SEED = [
  // Grade 1
  { name:"Ayanle Maxamed Faarax",   gender:"Male",   dob:dob(7),  gradeIndex:0, feeCategory:"Regular",     motherName:"Sahra Faarax",     placeOfBirth:"Mogadishu",  bloodGroup:"A+", previousSchool:"Xiddigta Somali KG", phone:"+252614500001" },
  { name:"Nimo Cali Warsame",       gender:"Female", dob:dob(7),  gradeIndex:0, feeCategory:"Orphan",      motherName:"Fadumo Warsame",   placeOfBirth:"Mogadishu",  bloodGroup:"O+", previousSchool:"",                   phone:"+252614500002" },
  { name:"Khadar Cabdi Guure",      gender:"Male",   dob:dob(7),  gradeIndex:0, feeCategory:"Regular",     motherName:"Luul Guure",       placeOfBirth:"Beledweyne", bloodGroup:"B+", previousSchool:"Annuur KG",          phone:"+252614500003" },
  { name:"Hana Yuusuf Dhiir",       gender:"Female", dob:dob(6),  gradeIndex:0, feeCategory:"Scholarship", motherName:"Deeqa Dhiir",      placeOfBirth:"Kismayo",    bloodGroup:"AB+",previousSchool:"",                   phone:"+252614500004", sponsorName:"Al-Baraka Foundation" },
  { name:"Siciid Xaashi Gaas",      gender:"Male",   dob:dob(7),  gradeIndex:0, feeCategory:"StaffChild",  motherName:"Caasha Gaas",      placeOfBirth:"Mogadishu",  bloodGroup:"O-", previousSchool:"Hanan KG",           phone:"+252614500005" },
  { name:"Sagal Abdirahman Ceel",   gender:"Female", dob:dob(7),  gradeIndex:0, feeCategory:"Regular",     motherName:"Xamdi Ceel",       placeOfBirth:"Mogadishu",  bloodGroup:"A-", previousSchool:"Saafi KG",           phone:"+252614500006" },
  // Grade 2
  { name:"Maxamed Bile Dheere",     gender:"Male",   dob:dob(8),  gradeIndex:1, feeCategory:"Regular",     motherName:"Fadumo Dheere",    placeOfBirth:"Mogadishu",  bloodGroup:"B-", previousSchool:"",                   phone:"+252614500007" },
  { name:"Nasrin Jaamac Siyaad",    gender:"Female", dob:dob(8),  gradeIndex:1, feeCategory:"Regular",     motherName:"Mariam Siyaad",    placeOfBirth:"Garowe",     bloodGroup:"O+", previousSchool:"Iftiin School",      phone:"+252614500008" },
  { name:"Farhan Cali Nuur",        gender:"Male",   dob:dob(8),  gradeIndex:1, feeCategory:"Orphan",      motherName:"Asha Nuur",        placeOfBirth:"Mogadishu",  bloodGroup:"A+", previousSchool:"Badar Primary",      phone:"+252614500009" },
  { name:"Ikraan Abdi Axmed",       gender:"Female", dob:dob(8),  gradeIndex:1, feeCategory:"Regular",     motherName:"Safiya Axmed",     placeOfBirth:"Mogadishu",  bloodGroup:"B+", previousSchool:"Saafi KG",           phone:"+252614500010" },
  { name:"Abdirashid Xuseen Afrah", gender:"Male",   dob:dob(9),  gradeIndex:1, feeCategory:"Discount",    motherName:"Hodan Afrah",      placeOfBirth:"Baidoa",     bloodGroup:"O+", discountPercent:25, discountReason:"Sibling discount", phone:"+252614500011" },
  // Grade 3
  { name:"Sharaf Axmed Garane",     gender:"Male",   dob:dob(9),  gradeIndex:2, feeCategory:"Regular",     motherName:"Hibo Garane",      placeOfBirth:"Mogadishu",  bloodGroup:"A+", previousSchool:"Al-Furqan Primary",  phone:"+252614500012" },
  { name:"Raha Cumar Cadde",        gender:"Female", dob:dob(9),  gradeIndex:2, feeCategory:"Regular",     motherName:"Caasha Cadde",     placeOfBirth:"Mogadishu",  bloodGroup:"B+", previousSchool:"Saafi Primary",      phone:"+252614500013" },
  { name:"Naciim Maxamuud Geelle",  gender:"Male",   dob:dob(9),  gradeIndex:2, feeCategory:"Scholarship", motherName:"Faadumo Geelle",   placeOfBirth:"Jilib",      bloodGroup:"AB-",previousSchool:"",                   phone:"+252614500014", sponsorName:"Ileys Foundation" },
  { name:"Samira Cali Duale",       gender:"Female", dob:dob(10), gradeIndex:2, feeCategory:"Regular",     motherName:"Luul Duale",       placeOfBirth:"Mogadishu",  bloodGroup:"O+", previousSchool:"Hanan Primary",      phone:"+252614500015" },
  { name:"Bashir Guure Jaamac",     gender:"Male",   dob:dob(9),  gradeIndex:2, feeCategory:"Regular",     motherName:"Deeqa Jaamac",     placeOfBirth:"Kismayo",    bloodGroup:"A-", previousSchool:"Nuur School",        phone:"+252614500016" },
  // Grade 4
  { name:"Hodan Faarax Abubakar",   gender:"Female", dob:dob(10), gradeIndex:3, feeCategory:"Regular",     motherName:"Asho Abubakar",    placeOfBirth:"Mogadishu",  bloodGroup:"B+", previousSchool:"Ileys Primary",      phone:"+252614500017" },
  { name:"Mustafa Ibraahin Noor",   gender:"Male",   dob:dob(10), gradeIndex:3, feeCategory:"Regular",     motherName:"Sahra Noor",       placeOfBirth:"Mogadishu",  bloodGroup:"O+", previousSchool:"Al-Nuur Primary",    phone:"+252614500018" },
  { name:"Ifrah Xasan Dhegey",      gender:"Female", dob:dob(10), gradeIndex:3, feeCategory:"StaffChild",  motherName:"Maryan Dhegey",    placeOfBirth:"Mogadishu",  bloodGroup:"A+", previousSchool:"Badar Primary",      phone:"+252614500019" },
  { name:"Zakariye Cabdi Warsame",  gender:"Male",   dob:dob(11), gradeIndex:3, feeCategory:"Orphan",      motherName:"Asho Warsame",     placeOfBirth:"Mogadishu",  bloodGroup:"O-", previousSchool:"Saafi Primary",      phone:"+252614500020" },
  { name:"Faadumo Saleebaan Ali",   gender:"Female", dob:dob(10), gradeIndex:3, feeCategory:"Regular",     motherName:"Asha Ali",         placeOfBirth:"Baidoa",     bloodGroup:"B-", previousSchool:"Iftiin School",      phone:"+252614500021" },
  // Grade 5
  { name:"Abshir Yuusuf Cigaal",    gender:"Male",   dob:dob(11), gradeIndex:4, feeCategory:"Regular",     motherName:"Caasha Cigaal",    placeOfBirth:"Mogadishu",  bloodGroup:"A+", previousSchool:"Al-Furqan Primary",  phone:"+252614500022" },
  { name:"Idil Cumar Haad",         gender:"Female", dob:dob(11), gradeIndex:4, feeCategory:"Regular",     motherName:"Faadumo Haad",     placeOfBirth:"Hargeisa",   bloodGroup:"O+", previousSchool:"Nuur Primary",       phone:"+252614500023" },
  { name:"Cawrala Axmed Siyaad",    gender:"Female", dob:dob(11), gradeIndex:4, feeCategory:"Scholarship", motherName:"Halima Siyaad",    placeOfBirth:"Mogadishu",  bloodGroup:"AB+",previousSchool:"",                   phone:"+252614500024", sponsorName:"Qaran Education Trust" },
  { name:"Daud Bile Osman",         gender:"Male",   dob:dob(12), gradeIndex:4, feeCategory:"Regular",     motherName:"Asho Osman",       placeOfBirth:"Mogadishu",  bloodGroup:"B+", previousSchool:"Hanan Primary",      phone:"+252614500025" },
  { name:"Luul Jaamac Diiriye",     gender:"Female", dob:dob(11), gradeIndex:4, feeCategory:"Regular",     motherName:"Nimo Diiriye",     placeOfBirth:"Jilib",      bloodGroup:"O-", previousSchool:"Al-Baraka Primary",  phone:"+252614500026" },
  // Grade 6
  { name:"Faisal Maxamed Hashi",    gender:"Male",   dob:dob(12), gradeIndex:5, feeCategory:"Regular",     motherName:"Safia Hashi",      placeOfBirth:"Mogadishu",  bloodGroup:"A+", previousSchool:"Iftiin Primary",     phone:"+252614500027" },
  { name:"Sahra Abdi Qeybdid",      gender:"Female", dob:dob(12), gradeIndex:5, feeCategory:"Regular",     motherName:"Hibo Qeybdid",     placeOfBirth:"Mogadishu",  bloodGroup:"B+", previousSchool:"Saafi Primary",      phone:"+252614500028" },
  { name:"Yahye Iimaan Xirsi",      gender:"Male",   dob:dob(13), gradeIndex:5, feeCategory:"Orphan",      motherName:"Saadaq Xirsi",     placeOfBirth:"Mogadishu",  bloodGroup:"O+", previousSchool:"Badar Primary",      phone:"+252614500029" },
  { name:"Amina Cabdilaahi Garaar", gender:"Female", dob:dob(12), gradeIndex:5, feeCategory:"Regular",     motherName:"Caasha Garaar",    placeOfBirth:"Mogadishu",  bloodGroup:"A-", previousSchool:"Al-Furqan Primary",  phone:"+252614500030" },
];

async function run() {
  await connectDB();

  if (DESTROY) {
    log("Destroying seeded data...");
    await Promise.all([
      Invoice.deleteMany({}),
      FeeStructure.deleteMany({}),
      TeachingAssignment.deleteMany({}),
      User.deleteMany({ role: { $in: ["Teacher", "Student", "Parent"] } }),
      SchoolClass.deleteMany({}),
      Subject.deleteMany({}),
      Term.deleteMany({}),
    ]);
    ok("All seeded data removed (admin account kept)");
    await mongoose.connection.close();
    process.exit(0);
  }

  // 1. Subjects
  log("Seeding subjects...");
  const subjectIds = {};
  for (const s of SUBJECTS_DATA) {
    const doc = await Subject.findOneAndUpdate({ code: s.code }, s, { upsert: true, new: true, setDefaultsOnInsert: true });
    subjectIds[s.code] = doc._id;
  }
  ok(`${SUBJECTS_DATA.length} subjects ready`);

  // 2. Classes
  log("Seeding classes...");
  const classIds = [];
  for (const c of CLASSES_DATA) {
    const doc = await SchoolClass.findOneAndUpdate(
      { name: c.name, section: c.section, academicYear: ACADEMIC_YEAR },
      { ...c, academicYear: ACADEMIC_YEAR, subjects: Object.values(subjectIds) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    classIds.push(doc._id);
  }
  ok(`${CLASSES_DATA.length} classes ready`);

  // 3. Terms
  log("Seeding terms...");
  const termIds = [];
  for (const t of TERMS_DATA) {
    const doc = await Term.findOneAndUpdate(
      { name: t.name, academicYear: t.academicYear },
      t,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    termIds.push(doc._id);
  }
  ok(`${TERMS_DATA.length} terms ready`);

  // 4. Teachers
  log("Seeding teachers...");
  const teacherDocs = [];
  for (const t of TEACHERS_DATA) {
    let teacher = await User.findOne({ email: t.email }).select("+password");
    if (!teacher) {
      teacher = await User.create({ ...t, password: "teacher123456", role: "Teacher", status: "Active", mustChangePassword: true });
      inf(`Created: ${t.name}`);
    } else {
      teacher.employeeId = t.employeeId;
      teacher.qualification = t.qualification;
      teacher.specialization = t.specialization;
      teacher.nationality = t.nationality;
      teacher.nin = t.nin;
      teacher.joinDate = t.joinDate;
      teacher.contractType = t.contractType;
      teacher.teacherEmergencyContact = t.teacherEmergencyContact;
      teacher.phone = t.phone;
      teacher.gender = t.gender;
      teacher.dob = t.dob;
      await teacher.save();
      inf(`Updated: ${t.name}`);
    }
    teacherDocs.push(teacher);
  }
  ok(`${teacherDocs.length} teachers ready`);

  // Assign class teachers
  for (let i = 0; i < Math.min(teacherDocs.length, classIds.length); i++) {
    await SchoolClass.findByIdAndUpdate(classIds[i], { classTeacher: teacherDocs[i]._id });
  }

  // 5. Teaching Assignments
  log("Seeding teaching assignments...");
  const assignPairs = [
    [0, ["MTH","SCI"]], [1, ["ENG","SOM"]], [2, ["ISL","ARB"]],
    [3, ["CMP","MTH"]], [4, ["SST","PE"]],  [5, ["SCI","ART"]],
    [6, ["ARB","ISL"]], [7, ["ENG","ART"]],
  ];
  let assignCount = 0;
  for (const [tIdx, codes] of assignPairs) {
    for (const code of codes) {
      for (const classId of classIds) {
        try {
          await TeachingAssignment.findOneAndUpdate(
            { teacher: teacherDocs[tIdx]._id, schoolClass: classId, subject: subjectIds[code] },
            { teacher: teacherDocs[tIdx]._id, schoolClass: classId, subject: subjectIds[code], academicYear: ACADEMIC_YEAR },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          assignCount++;
        } catch { /* skip dups */ }
      }
    }
  }
  ok(`${assignCount} teaching assignments ready`);

  // 6. Fee Structures
  log("Seeding fee structures...");
  const classDocs = await SchoolClass.find({ academicYear: ACADEMIC_YEAR }).lean();
  let feeCount = 0;
  for (const cls of classDocs) {
    const tuition = FEE_MAP[cls.name] || 120;
    for (const termId of termIds) {
      await FeeStructure.findOneAndUpdate(
        { schoolClass: cls._id, term: termId },
        {
          schoolClass: cls._id, term: termId,
          lineItems: [
            { label: "Tuition Fee", amount: tuition },
            { label: "Activity Fee", amount: 10 },
            { label: "Library Fee", amount: 5 },
          ],
          total: tuition + 15,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      feeCount++;
    }
  }
  ok(`${feeCount} fee structures ready`);

  // 7. Students + Parents + Invoices
  log("Seeding students, parents and invoices...");
  let studentCount = 0;
  let invoiceCount = 0;
  const term1Id = termIds[0];

  for (const [idx, s] of STUDENT_SEED.entries()) {
    const classId = classIds[s.gradeIndex];
    const admNo   = `STU2025${String(idx + 1).padStart(4, "0")}`;

    let feeCategory    = s.feeCategory || "Regular";
    let discountPercent = s.discountPercent != null ? s.discountPercent : (
      feeCategory === "Orphan"      ? 100 :
      feeCategory === "Scholarship" ? 100 :
      feeCategory === "StaffChild"  ? 50  : 0
    );
    let discountReason = s.discountReason || (
      feeCategory === "Orphan"      ? "Agoonimo (100% Free Tuition)" :
      feeCategory === "Scholarship" ? `Deeq Waxbarasho - ${s.sponsorName || "Sponsor"}` :
      feeCategory === "StaffChild"  ? "Staff Child (50% Discount)" : ""
    );

    let student = await User.findOne({ admissionNo: admNo });
    if (!student) {
      student = await User.create({
        name: s.name, admissionNo: admNo, password: "student123456",
        role: "Student", status: "Active", mustChangePassword: true,
        gender: s.gender, dob: s.dob, phone: s.phone,
        schoolClass: classId, enrolledAt: ago(180), enrollmentStatus: "Enrolled",
        motherName: s.motherName, placeOfBirth: s.placeOfBirth,
        address: "Mogadishu, Somalia", bloodGroup: s.bloodGroup || "",
        previousSchool: s.previousSchool || undefined,
        feeCategory, discountPercent,
        discountReason: discountReason || undefined,
        sponsorName: s.sponsorName || undefined,
        emergencyContact: { name: s.motherName, phone: s.phone, relation: "Mother" },
      });
      studentCount++;
      inf(`Student: ${s.name} (${admNo}) - ${feeCategory}`);
    }

    // Parent account
    const parentEmail = `parent.${admNo.toLowerCase()}@alhikma.edu.so`;
    let parent = await User.findOne({ email: parentEmail });
    if (!parent) {
      parent = await User.create({
        name: s.motherName || `Parent of ${s.name}`,
        email: parentEmail, password: "parent123456",
        role: "Parent", status: "Active", mustChangePassword: true, phone: s.phone,
      });
      if (!student.guardians?.some((g) => String(g.user) === String(parent._id))) {
        student.guardians = student.guardians || [];
        student.guardians.push({ user: parent._id, relation: "Mother" });
        await student.save();
      }
    }

    // Invoice for Term 1
    const existing = await Invoice.findOne({ student: student._id, term: term1Id });
    if (!existing) {
      const fs = await FeeStructure.findOne({ schoolClass: classId, term: term1Id });
      const baseTotal = fs ? fs.total : (FEE_MAP[CLASSES_DATA[s.gradeIndex].name] || 120) + 15;
      let invoiceTotal = baseTotal;
      let lineItems = fs ? [...fs.lineItems.map(li => ({label:li.label, amount:li.amount}))] : [
        { label:"Tuition Fee", amount:baseTotal-15 }, { label:"Activity Fee", amount:10 }, { label:"Library Fee", amount:5 }
      ];
      if (discountPercent === 100) {
        invoiceTotal = 0;
        lineItems = lineItems.map(li => ({ ...li, amount: 0 }));
      } else if (discountPercent > 0) {
        const factor = 1 - discountPercent / 100;
        invoiceTotal = Math.round(baseTotal * factor * 100) / 100;
        lineItems = lineItems.map(li => ({ ...li, amount: Math.round(li.amount * factor * 100) / 100 }));
      }

      const invoice = new Invoice({
        student: student._id, term: term1Id, schoolClass: classId,
        lineItems, total: invoiceTotal,
        dueDate: new Date("2025-12-20"),
        status: invoiceTotal === 0 ? "Paid" : "Unpaid",
        amountPaid: 0, balance: invoiceTotal, payments: [],
      });

      // Simulate partial payments for some regular students
      if (feeCategory === "Regular" && idx % 3 === 0 && invoiceTotal > 0) {
        const partial = Math.round(invoiceTotal / 2 * 100) / 100;
        invoice.payments.push({ amount: partial, date: ago(60), method: "evc", reference: `EVC-SEED-${admNo}`, phone: s.phone });
        invoice.recalculate();
      }

      await invoice.save();
      invoiceCount++;
    }
  }

  ok(`${studentCount} students created`);
  ok(`${invoiceCount} invoices created for Term 1`);

  log("\n==============================================");
  log("  Al-Hikma School -- Seed Complete!");
  log("==============================================");
  log(`  Subjects:     ${SUBJECTS_DATA.length}`);
  log(`  Classes:      ${CLASSES_DATA.length}  (Grade 1 to Grade 6)`);
  log(`  Terms:        ${TERMS_DATA.length}  (Term 2 is currently active)`);
  log(`  Teachers:     ${TEACHERS_DATA.length}  (password: teacher123456)`);
  log(`  Students:     ${STUDENT_SEED.length}  (password: student123456)`);
  log(`  Parents:      ${STUDENT_SEED.length}  (password: parent123456)`);
  log(`  Fee Structs:  ${feeCount}`);
  log(`  Invoices:     ${invoiceCount} (Term 1 - some with partial payments)`);
  log(`  Admin:        see .env (not changed)`);
  log("==============================================\n");

  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("Seed failed: " + err.message);
  if (err.stack) console.error(err.stack);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
