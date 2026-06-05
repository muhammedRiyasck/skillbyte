import { UserRole } from '../../../../shared/enums/UserRole';

export interface AuthUserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profilePicture?: string | null;
  accountStatus?: string;
}

export interface AuthResponseDto {
  userData: AuthUserData;
}
