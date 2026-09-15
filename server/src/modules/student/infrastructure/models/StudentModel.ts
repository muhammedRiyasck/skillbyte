import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISocialLinks {
  linkedin?: string;
  github?: string;
  website?: string;
  twitter?: string;
}

export interface IStudent extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  isEmailVerified: boolean;
  registeredVia: 'google' | 'local' | 'facebook';
  profilePictureUrl?: string | null;
  accountStatus: string;
  studentId?: string;

  // Profile details
  headline?: string | null;
  bio?: string | null;
  phoneNumber?: string | null;
  timezone?: string | null;
  location?: string | null;
  socialLinks?: ISocialLinks;

  // Learning preferences
  interests?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  learningGoals?: string[];

  // Gamification
  xp?: number;
  currentStreak?: number;
  longestStreak?: number;
  lastActiveDate?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const SocialLinksSchema = new Schema(
  {
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    website: { type: String, default: '' },
    twitter: { type: String, default: '' },
  },
  { _id: false },
);

const StudentSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    registeredVia: {
      type: String,
      enum: ['google', 'local', 'facebook'],
      default: 'local',
    },
    profilePictureUrl: { type: String, default: null },
    accountStatus: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },

    // Extended profile fields
    headline: { type: String, default: null },
    bio: { type: String, default: null },
    phoneNumber: { type: String, default: null },
    timezone: { type: String, default: 'UTC' },
    location: { type: String, default: null },
    socialLinks: { type: SocialLinksSchema, default: () => ({}) },

    // Learning profile
    interests: [{ type: String }],
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    learningGoals: [{ type: String }],

    // Gamification
    xp: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },
  },
  { timestamps: true },
);

StudentSchema.index({ interests: 1 });
StudentSchema.index({ xp: -1 });

export const StudentModel = mongoose.model<IStudent>('Student', StudentSchema);
