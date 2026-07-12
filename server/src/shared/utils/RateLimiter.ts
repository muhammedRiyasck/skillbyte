import rateLimit from 'express-rate-limit';

export const CustomLimit = (
  minit: number,
  message: string,
  maxAttempts: number = 100,
) =>
  rateLimit({
    windowMs: minit * 60 * 1000, // minit min
    max: maxAttempts,
    message: `Too many attempts to ${message}. Please try again ${minit} minute later.`,
  });
