export interface TempInstructorData {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  subject: string;
  jobTitle: string;
  experience: number;
  socialMediaLink: string;
  portfolioLink?: string;
  bio: string;
  resumeKey?: string; // S3 storage key, set after successful upload

}
