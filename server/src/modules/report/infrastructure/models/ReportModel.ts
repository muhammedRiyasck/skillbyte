import mongoose, { Document, Types } from 'mongoose';

export interface IReportDoc extends Document {
  _id: Types.ObjectId;
  reportedBy: Types.ObjectId;
  targetType: 'review' | 'course' | 'lesson';
  targetId: Types.ObjectId | string; // Review/Course/Lesson ID
  reason: string;
  description?: string;
  status: 'pending' | 'dismissed' | 'actioned';
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['review', 'course', 'lesson'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'dismissed', 'actioned'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

// Prevent same user from reporting the exact same target multiple times
ReportSchema.index(
  { reportedBy: 1, targetType: 1, targetId: 1 },
  { unique: true },
);

// Optimize queries for admin dashboard
ReportSchema.index({ status: 1, createdAt: -1 });

export const ReportModel = mongoose.model<IReportDoc>('Report', ReportSchema);
