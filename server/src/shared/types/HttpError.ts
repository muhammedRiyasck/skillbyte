/** Handles http error functionality. */
export class HttpError extends Error {
  public status: number;

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
