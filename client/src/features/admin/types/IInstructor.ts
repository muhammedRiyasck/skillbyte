export interface Instructor {
  instructorId:string
  name: string;
  email: string;
  profile: string;
  subject: string;
  jobTitle: string;
  experience: string;
  socialProfile: string;
  portfolio: string;
  accountStatus: "pending" | "active" | "suspend" | "rejected"
  approved:boolean
  rejected:boolean
  bio: string;
  phoneNumber: string;
  resumeUrl: string;
}
