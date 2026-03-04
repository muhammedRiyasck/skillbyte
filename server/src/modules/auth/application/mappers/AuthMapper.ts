import { Student } from '../../../student/domain/entities/Student';
import { Instructor } from '../../../instructor/domain/entities/Instructor';
import { Admin } from '../../../admin/domain/entities/Admin';

export interface AuthUserData {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string | null;
  accountStatus?: string;
}

export interface AuthResponseDto {
  userData: AuthUserData;
}

export class AuthMapper {
  static toAuthResponseDto(
    user: Student | Instructor | Admin,
    role: string,
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
    role: string,
  ): string {
    if (role === 'student') return (user as Student).studentId!;
    if (role === 'instructor') return (user as Instructor).instructorId!;
    return (user as Admin)._id!;
  }
}
