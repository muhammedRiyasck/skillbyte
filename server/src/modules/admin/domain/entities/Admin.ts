import { UserRole } from '../../../../shared/enums/UserRole';
import { AdminAccountStatus } from '../../../../shared/enums/AdminAccountStatus';

export class Admin {
  constructor(
    public name: string,
    public email: string,
    public passwordHash: string,
    public role: UserRole.ADMIN | UserRole.SUPERADMIN,
    public isEmailVerified: boolean = false,
    public accountStatus: AdminAccountStatus = AdminAccountStatus.ACTIVE,
    public profilePictureUrl?: string | null,
    public _id?: string, // Optional ID for database storage
  ) {}
}
