import { IOtpService } from "../../../shared/services/otp/interfaces/IOtpService";
import { OtpRateLimiter } from "../../../shared/services/otp/OtpRateLimiter";

export class ResendOtpUseCase {
  constructor(
    private redis: IOtpService,
    private rateLimiter: OtpRateLimiter
  ) {}

  async execute(email: string) {
    console.log('resend otp usecase worked',email)
    
    const ttl = await this.rateLimiter.isBlocked(email);
    if (ttl) throw new Error(`Please wait ${ttl} seconds before resending OTP.`);
    this.redis.sendOtp(email,'',"🔁 Resend OTP - SkillByte"); 
    await this.rateLimiter.block(email, 60); // 🔒 Block for 1 mins

   
  }
}
