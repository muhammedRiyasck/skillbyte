export interface SocialLinksDto {
  linkedin?: string;
  github?: string;
  website?: string;
  twitter?: string;
}

export interface StudentResponseDto {
  id?: string;
  name: string;
  email: string;
  isEmailVerified?: boolean;
  registeredVia: string;
  profilePicture?: string | null;
  accountStatus: string;
  headline?: string | null;
  bio?: string | null;
  phoneNumber?: string | null;
  timezone?: string | null;
  location?: string | null;
  socialLinks?: SocialLinksDto;
  interests?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  rank?: string;
  learningGoals?: string[];
  xp?: number;
  currentStreak?: number;
  longestStreak?: number;
  lastActiveDate?: Date | null;
  createdAt?: Date;
}
