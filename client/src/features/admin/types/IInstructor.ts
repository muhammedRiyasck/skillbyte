export interface Instructor {
  _id:string
  name: string;
  email: string;
  profile: string;
  subject: string;
  jobTitle: string;
  experience: string;
  socialProfile: string;
  portfolio: string;
  accountStatus: "pending" | "active" | "rejected"
  approved:boolean
  rejected:boolean
}
