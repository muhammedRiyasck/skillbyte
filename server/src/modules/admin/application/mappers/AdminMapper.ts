import { Admin } from '../../domain/entities/Admin';
import { IAdmin as IAdminDocument } from '../../infrastructure/models/AdminModel';
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
