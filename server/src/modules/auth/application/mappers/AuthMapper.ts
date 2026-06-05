import { Student } from '../../../student/domain/entities/Student';
import { Instructor } from '../../../instructor/domain/entities/Instructor';
import { Admin } from '../../../admin/domain/entities/Admin';
import { UserRole } from '../../../../shared/enums/UserRole';
import { AuthResponseDto, AuthUserData } from '../dtos/AuthResponseDto';

export class AuthMapper {
  static toAuthResponseDto(
    user: Student | Instructor | Admin,
    role: UserRole,
    id?: string,
  ): AuthResponseDto {
    const userData: AuthUserData = {
      id: id || this.extractId(user, role),
      name: user.name,
      email: user.email,
      role: role,
      profilePicture: user.profilePictureUrl,
      accountStatus: user.accountStatus,
    };

    return { userData };
  }

  private static extractId(
    user: Student | Instructor | Admin,
    role: UserRole,
  ): string {
    if (role === UserRole.STUDENT) return (user as Student).studentId!;
    if (role === UserRole.INSTRUCTOR) return (user as Instructor).instructorId!;
    return (user as Admin)._id!;
  }
}
