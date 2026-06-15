import { UserRole } from '../../../../shared/enums/UserRole';

export interface LoginRequestDto {
  email: string;
  password?: string;
  role: UserRole;
}
