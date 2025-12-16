import { Request, Response, NextFunction } from 'express';

interface AsyncHandlerFunction<T = Request> {
  (req: T, res: Response, next: NextFunction): Promise<void>;
}

interface AsyncHandler<T = Request> {
  (req: T, res: Response, next: NextFunction): void;
}

const asyncHandler =
  <T = Request>(fn: AsyncHandlerFunction<T>): AsyncHandler<T> =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export default asyncHandler;
