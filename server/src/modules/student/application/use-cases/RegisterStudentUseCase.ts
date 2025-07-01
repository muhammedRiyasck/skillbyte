import bcrypt from 'bcryptjs';
import { IStudentRepository } from '../../domain/IRepositories/IStudentRepository';
import { RedisOtpService } from '../../../../shared/services/otp/OtpService';
import { Student } from '../../domain/entities/Student';
import { Email } from '../../../../shared/validation/Email';
import { Name } from '../../../../shared/validation/Name';
import { password } from '../../../../shared/validation/Password';

export class RegisterStudentUseCase {
 constructor(
    private studentRepo: IStudentRepository,
    private readonly otpService: RedisOtpService
  ) {}

  async isUserExists(email: string): Promise<boolean> {
    const student = await this.studentRepo.findByEmail(email); 
    return student?true:false;
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
    const student = new Student(
      nameVO.value,
      emailVO.value,
      hashedPassword,
      true  // isEmailVerified
    );
    await this.studentRepo.save(student);
  }

}
