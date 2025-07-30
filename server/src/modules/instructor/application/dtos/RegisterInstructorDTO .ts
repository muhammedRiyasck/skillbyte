interface RegisterInstructorDTO {
  name: string;
  email: string;
  password: string;
  bio: string;
  expertise: string[];
  profilePictureUrl?: string; // Optional
  qualifications?: {
    title: string;
    year: number;
    photoUrl?: string; // Optional
  }[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
    youtube?: string;
  };
}
