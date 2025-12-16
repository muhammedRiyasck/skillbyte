import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../enums/HttpStatusCodes';
import { HttpError } from '../types/HttpError';
import { AuthenticatedRequest } from '../types/AuthenticatedRequestType';

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const AuthenticatedRequest = req as AuthenticatedRequest;
    const userRole =
      AuthenticatedRequest.body?.role ||
      AuthenticatedRequest.query?.role ||
      AuthenticatedRequest.user.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new HttpError('Forbidden: Access denied', HttpStatusCode.FORBIDDEN);
    }

    next();
  };
}
