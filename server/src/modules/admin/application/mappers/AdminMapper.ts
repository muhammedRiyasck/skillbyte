import { Admin } from '../../domain/entities/Admin';

/** Handles admin mapper functionality. */
export class AdminMapper {
  /**
   * To response for the AdminMapper entity.
   *
   * @param admin - The admin information.
   */
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
