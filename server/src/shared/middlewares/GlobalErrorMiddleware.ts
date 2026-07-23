import { Request, Response, NextFunction } from 'express';
import logger from '../utils/Logger';
import { HttpError } from '../types/HttpError';
import { ApiResponseHelper } from '../utils/ApiResponseHelper';

function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error(`Error occurred: ${err.message}`, { stack: err.stack });

  if (err instanceof HttpError) {
    const body: Record<string, unknown> = {
      success: false,
      message: err.message,
      error: err.message,
      statusCode: err.status,
    };
    if (err.data) {
      body.data = err.data;
    }
    res.status(err.status).json(body);
  } else {
    // Sanitize message in production
    const isDev = process.env.NODE_ENV === 'development';
    const message = isDev ? err.message : 'Internal Server Error';
    ApiResponseHelper.error(res, 'Internal Server Error', message);
  }
}

export default errorHandler;
