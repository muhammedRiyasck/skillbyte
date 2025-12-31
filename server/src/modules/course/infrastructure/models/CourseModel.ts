import mongoose, { Document, Types } from 'mongoose';

export interface ICourseDoc extends Document {
  _id: Types.ObjectId;
  instructorId: Types.ObjectId;
  thumbnailUrl: string | null;
  title: string;
  subText: string;
  category: string;
  courseLevel:
    | 'Beginner'
    | 'Intermediate'
    | 'Advanced'
    | 'Beginner - Intermediate'
    | 'Intermediate - Advanced'
    | 'All Level';
  language: string;
  price: number;
  features: string[];
  description: string;
  duration: string;
  tags: string[];
  status: 'draft' | 'list' | 'unlist';
  isBlocked: boolean;
  stripePriceId: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instructor',
      required: true,
    },
    thumbnailUrl: { type: String, default: null },
    title: { type: String, required: true },
    subText: { type: String, required: true },
    category: { type: String, required: true },
    courseLevel: {
      type: String,
      enum: [
        'Beginner',
        'Intermediate',
        'Advanced',
        'Beginner - Intermediate',
        'Intermediate - Advanced',
        'All Level',
      ],
      required: true,
    },
    language: { type: String, default: 'English' },
    price: { type: Number, default: 0 },
    features: [{ type: String, required: true }],
    description: { type: String, required: true },
    duration: { type: String, required: true },
    tags: [{ type: String, required: true }],
    status: {
      type: String,
      enum: ['draft', 'list', 'unlist'],
      default: 'draft',
    },
    isBlocked: { type: Boolean, default: false },
    stripePriceId: { type: String, default: '' },
  },
  { timestamps: true },
);

CourseSchema.index({ instructorId: 1 });
CourseSchema.index({ status: 1, createdAt: -1 });

export const CourseModel = mongoose.model<ICourseDoc>('Course', CourseSchema);
