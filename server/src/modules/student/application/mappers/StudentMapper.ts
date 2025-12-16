import { StudentRegistrationDto, StudentVerifyOtpDto } from '../dtos/StudentDtos';

export class StudentMapper {
  static toRegisterStudentEntity(dto: StudentRegistrationDto) {
    return {
      fullName: dto.fullName,
      email: dto.email,
      password: dto.password,
    };
  }

  static toVerifyOtpEntity(dto: StudentVerifyOtpDto) {
    return {
      email: dto.email,
      otp: dto.Otp,
    };
  }
}
