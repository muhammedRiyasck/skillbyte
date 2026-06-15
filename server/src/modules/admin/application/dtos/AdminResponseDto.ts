import { Admin } from '../../domain/entities/Admin';

export interface LoginAdminResponseDto {
  admin: Admin;
  accessToken: string;
  refreshToken: string;
}
