/**
 * Custom error class for HTTP-related errors with status codes.
 * This class extends the built-in Error class and includes a status property for HTTP status codes.
 */
export class HttpError extends Error {
  /**
   * The HTTP status code associated with the error.
   */
  public status: number;

  /**
   * Optional structured data to include in the error response.
   * Use this to provide actionable context (e.g. the pending booking that is blocking a new one).
   */
  public data?: Record<string, unknown>;

  /**
   * Creates a new HttpError instance.
   * @param message - The error message.
   * @param status - The HTTP status code.
   * @param data - Optional structured payload to forward to the client.
   */
  constructor(message: string, status: number, data?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'HttpError';
  }
}
