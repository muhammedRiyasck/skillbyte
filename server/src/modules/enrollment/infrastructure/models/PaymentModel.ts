import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  stripePaymentIntentId: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
  instructorId: mongoose.Types.ObjectId;
  adminFee: number;
  instructorAmount: number;
}

const PaymentSchema = new Schema(
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
    amount: { type: Number, required: true },
    currency: { type: String, default: 'inr' },
    stripePaymentIntentId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'pending',
    },
    metadata: { type: Map, of: String },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instructor',
      required: true,
    },
    adminFee: { type: Number, default: 0 },
    instructorAmount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const PaymentModel = mongoose.model<IPayment>('Payment', PaymentSchema);
