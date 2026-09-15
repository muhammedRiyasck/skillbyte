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

  static calculateRank(xp: number): string {
    if (xp >= 5001) return '💎 Master';
    if (xp >= 1001) return '🥇 Expert';
    if (xp >= 201) return '🥈 Scholar';
    return '🥉 Novice';
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
      headline: student.headline,
      bio: student.bio,
      phoneNumber: student.phoneNumber,
      timezone: student.timezone,
      location: student.location,
      socialLinks: student.socialLinks,
      interests: student.interests || [],
      experienceLevel: student.experienceLevel || 'beginner',
      rank: StudentMapper.calculateRank(student.xp || 0),
      learningGoals: student.learningGoals || [],
      xp: student.xp || 0,
      currentStreak: student.currentStreak || 0,
      longestStreak: student.longestStreak || 0,
      lastActiveDate: student.lastActiveDate,
      createdAt: student.createdAt,
    };
  }
}
