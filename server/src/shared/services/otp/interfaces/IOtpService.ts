export interface IOtpService {
  sendOtp(email: string , name:string , subject:string | undefined): Promise<void>;
  verifyOtp(email: string, otp: string): Promise<boolean>;
  storeTempData(email: string, data: any): Promise<void>;
  getTempData(email: string): Promise<any | null>;
  deleteTempData(email: string): Promise<void>;
}
