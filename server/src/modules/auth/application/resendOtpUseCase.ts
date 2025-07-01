import { IOtpService } from "../../../shared/services/otp/IOtpService";
import { OtpRateLimiter } from "../../../shared/services/otp/OtpRateLimiter";
import { IInstructorRepository } from "../../instructor/domain/IRepositories/IInstructorRepository";
import { IStudentRepository } from "../../student/domain/IRepositories/IStudentRepository";

export class ResendOtpUseCase {
  constructor(
    private otpRepo: IOtpService,
    private studentRepo: IStudentRepository,
    private instructorRepo: IInstructorRepository,
    private rateLimiter: OtpRateLimiter
  ) {}

  async execute(email: string, role: "student" | "instructor") {
    const repo = role === "student" ? this.studentRepo : this.instructorRepo;
    const user = await repo.findByEmail(email);
    if (!user) throw new Error("User not found");
    if (user.isEmailVerified) throw new Error("Email already verified");

    
    const ttl = await this.rateLimiter.isBlocked(email);
    if (ttl) throw new Error(`Please wait ${ttl} seconds before resending OTP.`);

    this.otpRepo.sendOtp(email,user.name,"🔁 Resend OTP - SkillByte"); // your helper
    // await this.otpRepo.saveOtp(email, otp);

    await this.rateLimiter.block(email, 120); // 🔒 Block for 2 mins

   
  }
}
