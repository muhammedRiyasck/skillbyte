import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ERROR_MESSAGES } from "../constants/messages";
import logger from "../utils/Logger";
import { HttpError } from "../types/HttpError";
import { HttpStatusCode } from "../enums/HttpStatusCodes";
import { AuthenticatedRequest } from "../types/AuthenticatedRequestType";

/**
 * Middleware to authenticate requests by verifying JWT tokens.
 * Checks for access_token in cookies, verifies it, and attaches decoded user data to req.user.
 * @param req - Express request object.
 * @param res - Express response object.
 * @param next - Express next function.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies.access_token;

  if (!token) {
    logger.warn(`Authentication failed: No token provided from IP: ${req.ip}`);
    throw new HttpError(ERROR_MESSAGES.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    logger.info(`Authentication successful for user: ${(decoded as any)?.id || 'unknown'} from IP: ${req.ip}`);
    next();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
      logger.warn(`Authentication failed: Invalid or expired token from IP: ${req.ip}, error: ${errorMessage}`);
      throw new HttpError(ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN, HttpStatusCode.UNAUTHORIZED);
    } else {
      logger.error(`Unexpected error during authentication from IP: ${req.ip}, error: ${errorMessage}`);
      throw new HttpError('Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }
}
