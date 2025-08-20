import rateLimit from "express-rate-limit";

export const fiveMinLimit = rateLimit({
  windowMs:5 * 60 * 1000, // 5 min
  max: 15,                  // only 5 attempts
  message: "Too many login attempts. Please try again later.",
});
