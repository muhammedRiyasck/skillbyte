import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';
import { ApiResponseHelper } from '../utils/ApiResponseHelper';
import { HttpStatusCode } from '../enums/HttpStatusCodes';

/**
 * Reusable Zod validation middleware factory.
 * Validates req.body against the provided schema.
 * Returns a 422 Unprocessable Entity with field-level error details on failure.
 */
export const validateRequest =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = (result.error as ZodError).issues.map((e: ZodIssue) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      ApiResponseHelper.error(
        res,
        'Validation failed',
        JSON.stringify(errors),
        HttpStatusCode.UNPROCESSABLE_ENTITY,
      );
      return;
    }

    // Overwrite req.body with the parsed (and coerced) data
    req.body = result.data;
    next();
  };
