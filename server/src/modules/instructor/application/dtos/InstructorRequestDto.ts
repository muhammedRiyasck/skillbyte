export interface InstructorRegistrationRequestDto {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  subject: string;
  jobTitle: string;
  socialMediaLink?: string;
  experience: number;
  portfolioLink?: string;
  bio?: string;
  customJobTitle?: string;
  customSubject?: string;
}

export interface InstructorVerifyOtpRequestDto {
  email: string;
  Otp: string;
}

export interface InstructorReapplyRequestDto {
  email: string;
  fullName?: string;
  phoneNumber?: string;
  subject?: string;
  jobTitle?: string;
  socialMediaLink?: string;
  experience?: string | number;
  portfolioLink?: string;
  bio?: string;
  customJobTitle?: string;
  customSubject?: string;
}

export interface InstructorProfileUpdateRequestDto {
  name?: string;
  phoneNumber?: string;
  subject?: string;
  jobTitle?: string;
  socialProfile?: string;
  experience?: string | number;
  portfolio?: string | null;
  bio?: string;
  profilePicture?: string | null;
}
