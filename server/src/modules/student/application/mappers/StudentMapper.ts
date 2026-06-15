import {
  StudentRegistrationRequestDto,
  StudentVerifyOtpRequestDto,
} from '../dtos/StudentRequestDto';
import { StudentResponseDto } from '../dtos/StudentResponseDto';
import { Student } from '../../domain/entities/Student';

export class StudentMapper {
  static toRegisterStudentEntity(dto: StudentRegistrationRequestDto) {
    return {
      fullName: dto.fullName,
      email: dto.email,
      password: dto.password,
    };
  }

  static toVerifyOtpEntity(dto: StudentVerifyOtpRequestDto) {
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
