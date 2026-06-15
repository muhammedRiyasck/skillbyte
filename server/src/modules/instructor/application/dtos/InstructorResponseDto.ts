export interface InstructorResponseDto {
  id?: string;
  name: string;
  email: string;
  subject: string;
  jobTitle: string;
  experience: number;
  socialProfile: string;
  portfolio: string | null;
  bio: string | null;
  phoneNumber: string | null;
  resumeUrl: string | null;
  profilePicture: string | null;
  isStripeVerified: boolean;
  stripeAccountId: string | null;
  isEmailVerified: boolean;
  accountStatus: string;
  averageRating: number;
  totalReviews: number;
  totalEarnings: number;
  withdrawnAmount: number;
  approved: boolean;
  rejected: boolean;
}
