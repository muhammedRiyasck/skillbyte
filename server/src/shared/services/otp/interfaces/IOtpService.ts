export interface IOtpService<T = Record<string, unknown>> {
  sendOtp(
    email: string,
    name: string,
    subject: string | undefined,
  ): Promise<void>;
  verifyOtp(email: string, otp: string): Promise<boolean>;
  storeTempData(email: string, data: T): Promise<void>;
  getTempData(email: string): Promise<T | null>;
  deleteTempData(email: string): Promise<void>;
}
