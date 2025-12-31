import mongoose, { Document, Types } from 'mongoose';

export interface IModuleDoc extends Document {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  title: string;
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ModuleSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    order: { type: Number, required: true },
  },
  { timestamps: true },
);

ModuleSchema.index({ courseId: 1, order: 1 });

export const ModuleModel = mongoose.model<IModuleDoc>('Module', ModuleSchema);
