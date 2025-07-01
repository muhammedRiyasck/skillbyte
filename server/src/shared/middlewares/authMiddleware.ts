import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.access_token;

  if (!token){
    res.status(401).json({ message: "Unauthorized" }) 
    return
   } ;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded; 
    next();
  } catch (err) {
     res.status(401).json({ message: "Invalid or expired token" });
  }
}
