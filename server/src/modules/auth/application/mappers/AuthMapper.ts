import { Student } from '../../../student/domain/entities/Student';
import { StudentResponseDto } from '../../../student/application/dtos/StudentResponseDto';
import { Instructor } from '../../../instructor/domain/entities/Instructor';
import { InstructorResponseDto } from '../../../instructor/application/dtos/InstructorResponseDto';
import { Admin } from '../../../admin/domain/entities/Admin';
import { UserRole } from '../../../../shared/enums/UserRole';
import { AuthResponseDto, AuthUserData } from '../dtos/AuthResponseDto';

export class AuthMapper {
  static toAuthResponseDto(
    user:
      | Student
      | StudentResponseDto
      | Instructor
      | InstructorResponseDto
      | Admin,
    role: UserRole,
    id?: string,
  ): AuthResponseDto {
    const profilePicture =
      'profilePicture' in user
        ? (user as StudentResponseDto | InstructorResponseDto).profilePicture
        : (user as Student | Instructor | Admin).profilePictureUrl;

    const userData: AuthUserData = {
      id: id || this.extractId(user, role),
      name: user.name,
      email: user.email,
      role: role,
      profilePicture: profilePicture,
      accountStatus: user.accountStatus,
    };

    return { userData };
  }

  private static extractId(
    user:
      | Student
      | StudentResponseDto
      | Instructor
      | InstructorResponseDto
      | Admin,
    role: UserRole,
  ): string {
    if (role === UserRole.STUDENT) {
      return 'id' in user ? (user.id as string) : (user as Student).studentId!;
    }
    if (role === UserRole.INSTRUCTOR) {
      return 'id' in user
        ? (user.id as string)
        : (user as Instructor).instructorId!;
    }
    return (user as Admin)._id!;
  }
}
