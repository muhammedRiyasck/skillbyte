import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAdmin extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'superadmin';
  isEmailVerified: boolean;
  accountStatus: 'active' | 'blocked' | 'suspended';
  profilePictureUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
    isEmailVerified: { type: Boolean, default: false },
    accountStatus: {
      type: String,
      enum: ['active', 'blocked', 'suspended'],
      default: 'active',
    },
    profilePictureUrl: { type: String, default: null },
  },
  { timestamps: true },
);

export const AdminModel = mongoose.model<IAdmin>('Admin', AdminSchema);
