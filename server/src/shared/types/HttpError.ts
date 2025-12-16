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
   * Creates a new HttpError instance.
   * @param message - The error message.
   * @param status - The HTTP status code.
   */
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'HttpError';
  }
}
