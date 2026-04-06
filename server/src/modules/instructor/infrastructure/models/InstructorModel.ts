import mongoose, { Document, Types } from 'mongoose';
import { InstructorAccountStatus } from '../../../../shared/enums/InstructorAccountStatus';

export interface IInstructor extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  subject: string;
  jobTitle: string;
  experience: number;
  socialProfile: string;
  portfolio: string | null;
  bio: string | null;
  phoneNumber: string | null;
  resumeUrl: string | null;
  profilePictureUrl: string | null;
  isEmailVerified: boolean;
  accountStatus: InstructorAccountStatus;
  approved: boolean;
  suspendNote: string | null;
  rejected: boolean;
  rejectedNote: string | null;
  doneBy: string | null;
  doneAt: Date | null;
  averageRating: number;
  totalReviews: number;
  totalEarnings: number;
  withdrawnAmount: number;
  stripeAccountId: string | null;
  isStripeVerified: boolean;
  paypalEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const InstructorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    subject: { type: String, required: true },
    jobTitle: { type: String, required: true },
    experience: { type: Number, required: true },
    socialProfile: { type: String, required: true },
    portfolio: { type: String, default: null },
    bio: { type: String, default: null },
    phoneNumber: { type: String, default: null },
    resumeUrl: { type: String, default: null },
    profilePictureUrl: { type: String, default: null },
    isEmailVerified: { type: Boolean, default: false },
    accountStatus: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'rejected'],
      default: 'pending',
    }, // Pending, Active, Suspended, Rejected
    approved: { type: Boolean, default: false },
    suspendNote: { type: String, default: null },
    rejected: { type: Boolean, default: false },
    rejectedNote: { type: String, default: null },
    doneBy: { type: String, default: null }, // ID of the admin who approved
    doneAt: { type: Date, default: null }, // Timestamp of approval
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    withdrawnAmount: { type: Number, default: 0 },
    stripeAccountId: { type: String, default: null },
    isStripeVerified: { type: Boolean, default: false },
    paypalEmail: { type: String, default: null }, // Instructor's PayPal Email
  },
  { timestamps: true },
);

export const InstructorModel = mongoose.model<IInstructor>(
  'Instructor',
  InstructorSchema,
);
