import { Admin } from '../../domain/entities/Admin';
import { IAdmin as IAdminDocument } from '../models/AdminModel';
import { UserRole } from '../../../../shared/enums/UserRole';
import { AdminAccountStatus } from '../../../../shared/enums/AdminAccountStatus';

export class AdminMapper {
  static toEntity(doc: IAdminDocument): Admin {
    return new Admin(
      doc.name,
      doc.email,
      doc.passwordHash || '',
      doc.role as UserRole.ADMIN | UserRole.SUPERADMIN,
      doc.isEmailVerified,
      doc.accountStatus as AdminAccountStatus,
      doc.profilePictureUrl,
      doc._id.toString(),
    );
  }
}
