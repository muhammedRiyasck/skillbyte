import bcrypt from 'bcryptjs';
import { IInstructorRepository } from '../../domain/IRepositories/IinstructorRepository';
import { Instructor } from '../../domain/entities/Instructor';
import { IOtpService } from '../../../../shared/services/otp/interfaces/IOtpService';
import { Email } from '../../../../shared/validation/Email';
import { Name } from '../../../../shared/validation/Name';
import { password } from '../../../../shared/validation/Password';

export class RegisterInstructorUseCase {
  constructor(
    private instructorRepo: IInstructorRepository,
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
    if (!dto) throw new Error("No data found");

    const valid = await this.otpService.verifyOtp(email, otp);
    if (!valid) throw new Error("Invalid or expired OTP");
    
    
    const emailVO = new Email(dto.email);
    const nameVO = new Name(dto.name);
    const passwordVO = new password(dto.password);
    const hashedPassword = await bcrypt.hash(passwordVO.value, 10);
    const instructor = new Instructor(
      nameVO.value,
      emailVO.value,
      hashedPassword,
      dto.bio,
      dto.profilePictureUrl ?? null,
      dto.socialLinks ?? {},
      dto.expertise,
      true, // isEmailVerified
      dto.qualifications ?? [], // qualifications
      'pending', // accountStatus
      false, // not approved
      false,
      null, // approvalNotes
      null, // approvedBy
      null, // approvedAt
      0, // avg rating
      0, // total reviews
    );
    await this.instructorRepo.save(instructor);
  }
}
