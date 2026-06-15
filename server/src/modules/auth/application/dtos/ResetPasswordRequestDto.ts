import { UserRole } from '../../../../shared/enums/UserRole';

export interface ResetPasswordRequestDto {
  token: string;
  password?: string;
  role: UserRole;
}
