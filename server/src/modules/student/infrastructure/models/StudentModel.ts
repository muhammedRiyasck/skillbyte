import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStudent extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  isEmailVerified: boolean;
  registeredVia: 'google' | 'local';
  profilePictureUrl?: string | null;
  accountStatus: string;
  studentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    registeredVia: {
      type: String,
      enum: ['google', 'local'],
      default: 'local',
    },
    profilePictureUrl: { type: String, default: null },
    accountStatus: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },
  },
  { timestamps: true },
);

export const StudentModel = mongoose.model<IStudent>('Student', StudentSchema);
