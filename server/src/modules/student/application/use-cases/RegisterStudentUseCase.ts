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
    console.log('haiiii')
    if(otp.length!==4) throw new Error('OTP should be 4 digit')

    const dto = await this.otpService.getTempData(email);
    if (!dto){
     const error = new Error("No data found or Your Current Data Expired") as any;
      error.status=500;
      throw error
    }
    
    const valid = await this.otpService.verifyOtp(email, otp);
  
    if (!valid) {
      const error = new Error("Invalid or expired OTP") as any;
      error.status=400;
      throw error
    }
      const responseLength = Object.entries(dto).length
      if (responseLength!==3) {
      const error = new Error("Some data's are missing") as any;
      error.status=400;
      throw error
    }
    const emailVO = new Email(dto.email);
    const nameVO = new Name(dto.fullName);
    const passwordVO = new password(dto.password);
    const hashedPassword = await bcrypt.hash(passwordVO.value, 10);
    const student = new Student(
      nameVO.value,
      emailVO.value,
      hashedPassword,
      true  // isEmailVerified
    );
    console.log(student)
    await this.studentRepo.save(student);
  }

}
