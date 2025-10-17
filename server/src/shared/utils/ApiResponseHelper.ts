import { Response } from 'express';
import { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from '../types/ApiResponse';
import { HttpStatusCode } from '../enums/HttpStatusCodes';

/**
 * Helper class for creating standardized API responses.
 * Provides methods to generate consistent success and error responses.
 */
export class ApiResponseHelper {
  /**
   * Creates a success response.
   * @param res - Express response object
   * @param message - Success message
   * @param data - Optional data payload
   * @param statusCode - HTTP status code (default: 200)
   * @returns Express response object
   */
  static success<T = any>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = HttpStatusCode.OK,
  ): Response<ApiSuccessResponse<T>> {
    const response: ApiSuccessResponse<T> = {
      success: true,
      message,
      data: data!,
      statusCode,
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Creates an error response.
   * @param res - Express response object
   * @param message - Error message
   * @param error - Optional detailed error information
   * @param statusCode - HTTP status code (default: 500)
   * @returns Express response object
   */
  static error(
    res: Response,
    message: string,
    error?: string,
    statusCode: number = HttpStatusCode.INTERNAL_SERVER_ERROR,
  ): Response<ApiErrorResponse> {
    const response: ApiErrorResponse = {
      success: false,
      message,
      error: error || 'An error occurred',
      statusCode,
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Creates a created response (for POST operations).
   * @param res - Express response object
   * @param message - Success message
   * @param data - Optional data payload
   * @returns Express response object
   */
  static created<T = any>(
    res: Response,
    message: string,
    data?: T,
  ): Response<ApiSuccessResponse<T>> {
    return this.success(res, message, data, HttpStatusCode.CREATED);
  }

  /**
   * Creates a no content response (for DELETE operations).
   * @param res - Express response object
   * @param message - Success message
   * @returns Express response object
   */
  static noContent(res: Response, message: string): Response<ApiSuccessResponse> {
    return this.success(res, message, undefined, HttpStatusCode.NO_CONTENT);
  }

  /**
   * Creates a bad request error response.
   * @param res - Express response object
   * @param message - Error message
   * @param error - Optional detailed error information
   * @returns Express response object
   */
  static badRequest(res: Response, message: string, error?: string): Response<ApiErrorResponse> {
    return this.error(res, message, error, HttpStatusCode.BAD_REQUEST);
  }

  /**
   * Creates an unauthorized error response.
   * @param res - Express response object
   * @param message - Error message
   * @param error - Optional detailed error information
   * @returns Express response object
   */
  static unauthorized(res: Response, message: string, error?: string): Response<ApiErrorResponse> {
    return this.error(res, message, error, HttpStatusCode.UNAUTHORIZED);
  }

  /**
   * Creates a forbidden error response.
   * @param res - Express response object
   * @param message - Error message
   * @param error - Optional detailed error information
   * @returns Express response object
   */
  static forbidden(res: Response, message: string, error?: string): Response<ApiErrorResponse> {
    return this.error(res, message, error, HttpStatusCode.FORBIDDEN);
  }

  /**
   * Creates a not found error response.
   * @param res - Express response object
   * @param message - Error message
   * @param error - Optional detailed error information
   * @returns Express response object
   */
  static notFound(res: Response, message: string, error?: string): Response<ApiErrorResponse> {
    return this.error(res, message, error, HttpStatusCode.NOT_FOUND);
  }

  /**
   * Creates a conflict error response.
   * @param res - Express response object
   * @param message - Error message
   * @param error - Optional detailed error information
   * @returns Express response object
   */
  static conflict(res: Response, message: string, error?: string): Response<ApiErrorResponse> {
    return this.error(res, message, error, HttpStatusCode.CONFLICT);
  }
}
