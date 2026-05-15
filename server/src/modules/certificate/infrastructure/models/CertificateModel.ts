import mongoose, { Document, Schema } from 'mongoose';

export interface ICertificate extends Document {
  _id: mongoose.Types.ObjectId;
  enrollmentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  certificateNumber: string;
  verificationCode: string;
  issuedAt: Date;
  pdfUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema(
  {
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true,
      unique: true,
    },
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
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    verificationCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    issuedAt: { type: Date, default: Date.now },
    pdfUrl: { type: String, default: null },
  },
  { timestamps: true },
);

CertificateSchema.index({ userId: 1, courseId: 1 });

export const CertificateModel = mongoose.model<ICertificate>(
  'Certificate',
  CertificateSchema,
);
