import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITopInstructor extends Document {
  instructorId: Types.ObjectId;
  name: string;
  profilePictureUrl: string | null;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const TopInstructorSchema = new Schema(
  {
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: 'Instructor',
      required: true,
    },
    name: { type: String, required: true },
    profilePictureUrl: { type: String, default: null },
    totalEarnings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    capped: { size: 1024 * 1024, max: 10 }, // Capped collection with max 10 documents
  },
);

export const TopInstructorModel = mongoose.model<ITopInstructor>(
  'TopInstructor',
  TopInstructorSchema,
);
