import { UserRole } from '../../../../shared/enums/UserRole';
import { AdminAccountStatus } from '../../../../shared/enums/AdminAccountStatus';
import { IAdminDashboardData } from '../../domain/interfaces/IDashboardData';

export interface AdminProfileDto {
  id?: string;
  name: string;
  email: string;
  role: UserRole.ADMIN | UserRole.SUPERADMIN;
  isEmailVerified: boolean;
  accountStatus: AdminAccountStatus;
  profilePictureUrl?: string | null;
}

export interface LoginAdminResponseDto {
  admin: AdminProfileDto;
  accessToken: string;
  refreshToken: string;
}

// Dashboard use case returns this DTO at the application boundary
export type AdminDashboardResponseDto = IAdminDashboardData;
