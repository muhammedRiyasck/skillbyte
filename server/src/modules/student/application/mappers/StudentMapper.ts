import {
  StudentRegistrationDto,
  StudentVerifyOtpDto,
  StudentResponseDto,
} from '../dtos/StudentDtos';
import { Student } from '../../domain/entities/Student';

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

  static toResponseDto(student: Student): StudentResponseDto {
    return {
      id: student.studentId,
      name: student.name,
      email: student.email,
      isEmailVerified: student.isEmailVerified,
      registeredVia: student.registeredVia,
      profilePicture: student.profilePictureUrl,
      accountStatus: student.accountStatus,
    };
  }
}
