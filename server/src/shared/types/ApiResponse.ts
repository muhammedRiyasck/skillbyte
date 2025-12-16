/**
 * Standard API response structure.
 * Provides a consistent format for all API responses.
 */
export interface ApiResponse<T = unknown> {
  /** Indicates if the request was successful */
  success: boolean;
  /** Human-readable message describing the response */
  message: string;
  /** Optional data payload for successful responses */
  data?: T;
  /** Optional error details for failed responses */
  error?: string;
  /** HTTP status code */
  statusCode: number;
}

/**
 * Success response type for type safety.
 */
export interface ApiSuccessResponse<T = unknown> extends ApiResponse<T> {
  success: true;
  data: T;
}

/**
 * Error response type for type safety.
 */
export interface ApiErrorResponse extends ApiResponse {
  success: false;
  error: string;
}
