import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

import env from "./src/config/env.js";
import apiRoutes from "./src/routes/index.js";
import notFound from "./src/middleware/notFound.js";
import errorHandler from "./src/middleware/errorHandler.js";

const app = express();

// security headers
app.use(helmet());

// cors: allow the frontend origin, plus localhost during development
const allowedOrigins = [env.frontendUrl, "http://localhost:5173"];
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// basic rate limit on the api
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api", apiLimiter);

// health check
app.get("/health", (req, res) => {
  res.json({ success: true, status: "ok", env: env.nodeEnv, time: new Date().toISOString() });
});

// api routes
app.use("/api", apiRoutes);

// 404 and errors
app.use(notFound);
app.use(errorHandler);

export default app;
