import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.access_token;

  if (!token){
    console.log('no tokken')
    res.status(401).json({ message: "Unauthorized" }) 
    return
   } ;
   console.log('tokken present')
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded; 
    next();
  } catch (err) {
     res.status(401).json({ message: "Invalid or expired token" });
  }
}
