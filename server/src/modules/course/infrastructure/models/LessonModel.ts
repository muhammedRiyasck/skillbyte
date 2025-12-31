import mongoose, { Document, Types } from 'mongoose';

export interface ILessonDoc extends Document {
  _id: Types.ObjectId;
  moduleId: Types.ObjectId;
  title: string;
  description: string;
  contentType: 'video' | 'pdf';
  fileName: string;
  order: number;
  duration: number;
  resources: string[];
  isFreePreview: boolean;
  isPublished: boolean;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    contentType: { type: String, enum: ['video', 'pdf'], default: 'video' },
    fileName: { type: String, required: true },
    order: Number,
    duration: Number,
    resources: [{ type: String }],
    isFreePreview: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

LessonSchema.index({ moduleId: 1, order: 1 });

export const LessonModel = mongoose.model<ILessonDoc>('Lesson', LessonSchema);
