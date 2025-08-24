import bcrypt from 'bcryptjs';
import { IInstructorRepository } from '../../domain/IRepositories/IinstructorRepository';
import { Instructor } from '../../domain/entities/Instructor';
import { IOtpService } from '../../../../shared/services/otp/interfaces/IOtpService';
import { Email } from '../../../../shared/validation/Email';
import { Name } from '../../../../shared/validation/Name';
import { password } from '../../../../shared/validation/Password';

export class RegisterInstructorUseCase {
  constructor(
    private readonly instructorRepo: IInstructorRepository,
    private readonly otpService: IOtpService
  ) {}

  async isUserExists(email: string): Promise<boolean> {
    const instructor = await this.instructorRepo.findByEmail(email); 
    return instructor ? true : false;
  }

  async execute(email:string,otp:string): Promise<void> {
    // const exists = await this.isUserExists(email);
    // if (exists) throw new Error('Email already exists');
    
    const dto = await this.otpService.getTempData(email);
    if (!dto) {
      const error = new Error("No data found or Your Current Data Expired")as any;
      error.status = 500;
      throw error
    }

    const valid = await this.otpService.verifyOtp(email, otp);
    if (!valid) {
      const error = new Error("Invalid or expired OTP") as any;
      error.status=400;
      throw error
    }
    
    const responseLength = Object.entries(dto).length
      if (responseLength!==8) {
      const error = new Error("Some data's are missing") as any;
      error.status=400;
      throw error
    }

    const nameVO = new Name(dto.fullName);
    const emailVO = new Email(dto.email);
    const passwordVO = new password(dto.password);
    const hashedPassword = await bcrypt.hash(passwordVO.value, 10);
    
    const instructor = new Instructor(
      nameVO.value,
      emailVO.value,
      hashedPassword,
      dto.subject,
      dto.jobTitle,
      Number(dto.experience),
      dto.socialMediaLink,
      dto.portfolio,
      dto.bio,
      dto.profilePictureUrl ?? null,
      true, // isEmailVerified
      'pending', // accountStatus
      false, // not approved
      false, // not rejected
      null, // approvalNotes
      null, // approvedBy
      null, // approvedAt
      0, // avg rating
      0, // total reviews
    );
    console.log(instructor,'just before saved')
    await this.instructorRepo.save(instructor);
  }
}
