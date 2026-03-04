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
  accountStatus: "pending" | "active" | "suspend" | "rejected"
  approved: boolean
  rejected: boolean
  bio: string;
  phoneNumber: string;
  resumeUrl: string;
}
