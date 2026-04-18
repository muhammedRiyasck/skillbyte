import mongoose, { Document, Types } from 'mongoose';

export interface IReviewDoc extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  targetType: 'course' | 'session';
  targetId: Types.ObjectId | string;
  instructorId: Types.ObjectId;
  rating: number;
  comment: string;
  helpfulCount: number;
  upvotedBy: Types.ObjectId[];
  isReported: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['course', 'session'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.Mixed, // Can be ObjectId (Course) or string (Booking)
      required: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instructor',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    upvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    isReported: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Enforce one review per student per target
ReviewSchema.index(
  { studentId: 1, targetType: 1, targetId: 1 },
  { unique: true },
);

// Optimize queries for a specific target
ReviewSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
ReviewSchema.index({ targetType: 1, targetId: 1, helpfulCount: -1 });

// Optimize instructor aggregate queries
ReviewSchema.index({ instructorId: 1, rating: 1 });

export const ReviewModel = mongoose.model<IReviewDoc>('Review', ReviewSchema);
