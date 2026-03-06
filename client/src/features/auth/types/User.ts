import { UserRole } from "@shared/enums/UserRole";

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  role: UserRole;
}
