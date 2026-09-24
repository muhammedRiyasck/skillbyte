import { Response } from 'express';
import { ApiSuccessResponse, ApiErrorResponse } from '../types/ApiResponse';
import { HttpStatusCode } from '../enums/HttpStatusCodes';

/** Handles api response helper functionality. */
export class ApiResponseHelper {
  /**
   * Success for the ApiResponseHelper entity.
   *
   * @param res - The Express response object.
   * @param message - The message information.
   * @param data - The data information.
   * @param statusCode - The status code information.
   * @returns The standardized HTTP response.
   */
  static success<T = unknown>(
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
   * Error for the ApiResponseHelper entity.
   *
   * @param res - The Express response object.
   * @param message - The message information.
   * @param error - The error information.
   * @param statusCode - The status code information.
   * @returns The standardized HTTP response.
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
   * Created for the ApiResponseHelper entity.
   *
   * @param res - The Express response object.
   * @param message - The message information.
   * @param data - The data information.
   * @returns The standardized HTTP response.
   */
  static created<T = unknown>(
    res: Response,
    message: string,
    data?: T,
  ): Response<ApiSuccessResponse<T>> {
    return this.success(res, message, data, HttpStatusCode.CREATED);
  }

  /**
   * No content for the ApiResponseHelper entity.
   *
   * @param res - The Express response object.
   * @param message - The message information.
   * @returns The standardized HTTP response.
   */
  static noContent(
    res: Response,
    message: string,
  ): Response<ApiSuccessResponse> {
    return this.success<unknown>(
      res,
      message,
      undefined,
      HttpStatusCode.NO_CONTENT,
    );
  }

  /**
   * Bad request for the ApiResponseHelper entity.
   *
   * @param res - The Express response object.
   * @param message - The message information.
   * @param error - The error information.
   * @returns The standardized HTTP response.
   */
  static badRequest(
    res: Response,
    message: string,
    error?: string,
  ): Response<ApiErrorResponse> {
    return this.error(res, message, error, HttpStatusCode.BAD_REQUEST);
  }

  /**
   * Unauthorized for the ApiResponseHelper entity.
   *
   * @param res - The Express response object.
   * @param message - The message information.
   * @param error - The error information.
   * @returns The standardized HTTP response.
   */
  static unauthorized(
    res: Response,
    message: string,
    error?: string,
  ): Response<ApiErrorResponse> {
    return this.error(res, message, error, HttpStatusCode.UNAUTHORIZED);
  }

  /**
   * Forbidden for the ApiResponseHelper entity.
   *
   * @param res - The Express response object.
   * @param message - The message information.
   * @param error - The error information.
   * @returns The standardized HTTP response.
   */
  static forbidden(
    res: Response,
    message: string,
    error?: string,
  ): Response<ApiErrorResponse> {
    return this.error(res, message, error, HttpStatusCode.FORBIDDEN);
  }

  /**
   * Not found for the ApiResponseHelper entity.
   *
   * @param res - The Express response object.
   * @param message - The message information.
   * @param error - The error information.
   * @returns The standardized HTTP response.
   */
  static notFound(
    res: Response,
    message: string,
    error?: string,
  ): Response<ApiErrorResponse> {
    return this.error(res, message, error, HttpStatusCode.NOT_FOUND);
  }

  /**
   * Conflict for the ApiResponseHelper entity.
   *
   * @param res - The Express response object.
   * @param message - The message information.
   * @param error - The error information.
   * @returns The standardized HTTP response.
   */
  static conflict(
    res: Response,
    message: string,
    error?: string,
  ): Response<ApiErrorResponse> {
    return this.error(res, message, error, HttpStatusCode.CONFLICT);
  }
}
