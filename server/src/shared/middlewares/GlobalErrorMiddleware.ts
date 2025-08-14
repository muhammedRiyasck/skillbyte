import { Request, Response, NextFunction } from "express";

// errorHandler.js
interface CustomError extends Error {
    status?: number;
}

function errorHandler(err: CustomError,req: Request,res: Response,next: NextFunction): void {
      
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
    
}

export default errorHandler
