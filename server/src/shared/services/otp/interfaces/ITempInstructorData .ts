export interface TempInstructorData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  subject: string;
  jobTitle: string;
  experience: number;
  socialMediaLink: string;
  portfolioLink?: string;
  bio: string;
  resumeFile?: { path: string; originalname: string };
}
