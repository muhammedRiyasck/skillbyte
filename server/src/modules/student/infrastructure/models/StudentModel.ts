import mongoose, { Schema } from 'mongoose';

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

export const StudentModel = mongoose.model('Student', StudentSchema);
