export interface StudentResponseDto {
  id?: string;
  name: string;
  email: string;
  isEmailVerified?: boolean;
  registeredVia: string;
  profilePicture?: string | null;
  accountStatus: string;
}
