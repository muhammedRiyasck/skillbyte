export interface IOtpService {
  sendOtp(
    email: string,
    name: string,
    subject: string | undefined,
  ): Promise<void>;
  verifyOtp(email: string, otp: string): Promise<boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  storeTempData(email: string, data: any): Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getTempData(email: string): Promise<any>;
  deleteTempData(email: string): Promise<void>;
}
