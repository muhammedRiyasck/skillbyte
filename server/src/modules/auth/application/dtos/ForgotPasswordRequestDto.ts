import { UserRole } from '../../../../shared/enums/UserRole';

export interface ForgotPasswordRequestDto {
  email: string;
  role: UserRole;
}
