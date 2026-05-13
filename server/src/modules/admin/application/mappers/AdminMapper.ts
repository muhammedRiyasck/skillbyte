import { Admin } from '../../domain/entities/Admin';

export class AdminMapper {
  static toResponse(admin: Admin) {
    return {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isEmailVerified: admin.isEmailVerified,
      accountStatus: admin.accountStatus,
      profilePictureUrl: admin.profilePictureUrl,
    };
  }
}
