import mongoose, { Document } from 'mongoose';

export interface IPaymentDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  studentName: string;
  studentEmail: string;
  courseId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  stripePaymentIntentId?: string;
  paypalOrderId?: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  metadata?: Record<string, unknown>;
  instructorId: mongoose.Types.ObjectId;
  adminFee: number;
  instructorAmount: number;
  productName: string;
  productImage?: string;
  convertedAmount?: number;
  convertedCurrency?: string;
  createdAt: Date;
  updatedAt: Date;
}
