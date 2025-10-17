import { Request } from "express";

/**
 * Interface for authenticated request with user data.
 */
export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: string;
  };
}
