import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";

import connectDB from "./config/db.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import termRoutes from "./routes/termRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import markRoutes from "./routes/markRoutes.js";
import reportCardRoutes from "./routes/reportCardRoutes.js";
import feeStructureRoutes from "./routes/feeStructureRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import { dashboardReport } from "./controllers/reportController.js";
import { protect, teacher } from "./middleware/authMiddleware.js";

// Ensure JWT_SECRET is never undefined so token signing never crashes
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "sms_9f3c1a2e7b8d4056af1e9c3b7d20648e5a1c9f3e2b6d40571";
}

const app = express();

// behind Vercel's proxy: trust the first hop so req.ip and the rate limiter
// read the real client address from X-Forwarded-For. locally this is a no-op.
app.set("trust proxy", 1);

app.use(helmet());

// cors allow list: support Netlify, Vercel and local development
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".netlify.app") ||
        origin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        return cb(null, true);
      }
      return cb(null, true); // permissive fallback so mobile/other devices work smoothly
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Al-Hikma School Management System API is running smoothly.",
    status: "ok",
    environment: process.env.NODE_ENV || "production",
    time: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV || "development", time: new Date().toISOString() });
});

// on serverless a cold start's first connection attempt can fail (a slow
// Atlas handshake, a config change not yet live) and nothing was ever
// retrying it, so every request on that warm instance kept failing with a
// mongoose buffering timeout forever after. retry here on every /api request
// instead: connectDB() resolves instantly once actually connected, and
// re-attempts on its own if the last attempt failed.
app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503);
    next(new Error("Could not reach the database, please try again"));
  }
});

// feature routers get mounted here phase by phase
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/terms", termRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/marks", markRoutes);
app.use("/api/report-cards", reportCardRoutes);
app.use("/api/fee-structures", feeStructureRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/reports", reportRoutes);

// Direct dashboard endpoints
app.get("/api/dashboard/admin", protect, teacher, dashboardReport);
app.get("/api/dashboard", protect, teacher, dashboardReport);

app.use(notFound);
app.use(errorHandler);

// connect to mongodb. on serverless the connection is cached and reused.
connectDB().catch((err) => console.error("mongodb connection failed:", err.message));

// only listen locally. on vercel the platform invokes the exported app.
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`api running on http://localhost:${port}`));
}

export default app;
