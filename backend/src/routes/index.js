import { Router } from "express";

// the single place every feature router gets mounted.
// phase by phase we add: auth, students, classes, subjects, staff, terms,
// attendance, exams, fees, timetable, announcements, applications, reports.
const router = Router();

router.get("/", (req, res) => {
  res.json({ success: true, message: "school management system api", version: "1.0.0" });
});

export default router;
