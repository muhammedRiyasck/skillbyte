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
  /** S3 key of the temp-uploaded resume (uploaded directly by client via pre-signed URL) */
  tempResumeKey?: string;
}
