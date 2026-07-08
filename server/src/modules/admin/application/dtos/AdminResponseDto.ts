import { Admin } from '../../domain/entities/Admin';
import { IAdminDashboardData } from '../../domain/interfaces/IDashboardData';

export interface LoginAdminResponseDto {
  admin: Admin;
  accessToken: string;
  refreshToken: string;
}

// Dashboard use case returns this DTO at the application boundary
export type AdminDashboardResponseDto = IAdminDashboardData;
