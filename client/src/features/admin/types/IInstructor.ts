import { InstructorAccountStatus } from "@shared/enums/InstructorAccountStatus";

export interface Instructor {
  id: string
  name: string;
  email: string;
  profilePicture: string;
  subject: string;
  jobTitle: string;
  experience: string;
  socialProfile: string;
  portfolio: string;
  accountStatus: InstructorAccountStatus
  approved: boolean
  rejected: boolean
  bio: string;
  phoneNumber: string;
  resumeUrl: string;
}
