import jwt from "jsonwebtoken";

export function generateAccessToken(payload: object) {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "15m", // 🔐 short-lived
  });
}
