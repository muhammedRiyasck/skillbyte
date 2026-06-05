import { Admin } from '../../domain/entities/Admin';

export interface LoginAdminResponseDTO {
  admin: Admin;
  accessToken: string;
  refreshToken: string;
}
