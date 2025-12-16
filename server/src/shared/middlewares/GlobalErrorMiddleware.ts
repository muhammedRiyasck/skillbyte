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
    ApiResponseHelper.error(res, err.message, err.message, err.status);
  } else {
    ApiResponseHelper.error(res, 'Internal Server Error', err.message);
  }
}

export default errorHandler;
