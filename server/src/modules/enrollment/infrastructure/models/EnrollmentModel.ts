import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  paymentId?: mongoose.Types.ObjectId;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'refunded';
  enrolledAt: Date;
  completedAt?: Date;
  progress: number;
  lessonProgress: {
    lessonId: mongoose.Types.ObjectId;
    lastWatchedSecond: number;
    totalDuration: number;
    isCompleted: boolean;
    lastUpdated?: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    progress: { type: Number, default: 0 }, // Percentage 0-100
    lessonProgress: [
      {
        lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
        lastWatchedSecond: { type: Number, default: 0 },
        totalDuration: { type: Number, default: 0 },
        isCompleted: { type: Boolean, default: false },
        lastUpdated: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

// Compound index to prevent double enrollment
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const EnrollmentModel = mongoose.model<IEnrollment>(
  'Enrollment',
  EnrollmentSchema,
);
