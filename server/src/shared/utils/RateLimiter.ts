import rateLimit from "express-rate-limit";


export const fiveMinLimit = (minit:number,message:string)=> rateLimit({
  windowMs:minit * 60 * 1000, // 5 min
  max: 15,                  // only 5 attempts
  message: `Too many attempts to ${message}. Please try again ${minit} minute later.`,
});
