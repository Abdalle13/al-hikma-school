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

// fail fast on a missing secret rather than signing tokens with undefined
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set. Copy backend/.env.example to backend/.env and fill it in.");
}

const app = express();

app.use(helmet());

// cors allow list: the configured frontend plus local dev
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
];
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiLimiter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV || "development", time: new Date().toISOString() });
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
