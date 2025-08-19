import { Request, Response, NextFunction } from 'express';


interface AsyncHandlerFunction {
    (req: Request, res: Response, next: NextFunction): Promise<any>;
}

interface AsyncHandler {
    (req: Request, res: Response, next: NextFunction): void;
}

const asyncHandler = (fn: AsyncHandlerFunction): AsyncHandler => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler
