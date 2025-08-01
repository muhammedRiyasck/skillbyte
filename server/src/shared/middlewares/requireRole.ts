import { Response, NextFunction } from "express";

export function requireRole(...allowedRoles: string[]) {
  return (req: any, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({ message: "Forbidden: Access denied" });
      return;
    }

    next();
  };
}
