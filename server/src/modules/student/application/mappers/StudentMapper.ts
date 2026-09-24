import {
  StudentRegistrationRequestDto,
  StudentVerifyOtpRequestDto,
} from '../dtos/StudentRequestDto';
import { StudentResponseDto } from '../dtos/StudentResponseDto';
import { Student } from '../../domain/entities/Student';

/** Handles student mapper functionality. */
export class StudentMapper {
  /**
   * To register student entity for the StudentMapper entity.
   *
   * @param dto - The data transfer object containing request details.
   */
  static toRegisterStudentEntity(dto: StudentRegistrationRequestDto) {
    return {
      fullName: dto.fullName,
      email: dto.email,
      password: dto.password,
    };
  }

  /**
   * To verify otp entity for the StudentMapper entity.
   *
   * @param dto - The data transfer object containing request details.
   */
  static toVerifyOtpEntity(dto: StudentVerifyOtpRequestDto) {
    return {
      email: dto.email,
      otp: dto.Otp,
    };
  }

  /**
   * Calculate rank for the StudentMapper entity.
   *
   * @param xp - The xp information.
   * @returns The result of the operation.
   */
  static calculateRank(xp: number): string {
    if (xp >= 5001) return '💎 Master';
    if (xp >= 1001) return '🥇 Expert';
    if (xp >= 201) return '🥈 Scholar';
    return '🥉 Novice';
  }

  /**
   * To response dto for the StudentMapper entity.
   *
   * @param student - The student information.
   * @returns The standardized HTTP response.
   */
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
