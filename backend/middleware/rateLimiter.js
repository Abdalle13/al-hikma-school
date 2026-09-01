import rateLimit from "express-rate-limit";

// general limiter for the whole api. tighter per route limiters can be added later.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

export default apiLimiter;
