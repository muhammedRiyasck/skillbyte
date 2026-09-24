export interface ISocialLinks {
  linkedin?: string;
  github?: string;
  website?: string;
  twitter?: string;
}

/** Handles student functionality. */
export class Student {
  constructor(
    public name: string,
    public email: string,
    public passwordHash: string,
    public isEmailVerified?: boolean,
    public registeredVia: 'google' | 'local' | 'facebook' = 'local',
    public profilePictureUrl?: string | null,
    public accountStatus: string = 'active',
    public studentId?: string,
    public headline?: string | null,
    public bio?: string | null,
    public phoneNumber?: string | null,
    public timezone?: string | null,
    public location?: string | null,
    public socialLinks?: ISocialLinks,
    public interests?: string[],
    public experienceLevel?: 'beginner' | 'intermediate' | 'advanced',
    public learningGoals?: string[],
    public xp?: number,
    public currentStreak?: number,
    public longestStreak?: number,
    public lastActiveDate?: Date | null,
    public createdAt?: Date,
  ) {}
}
