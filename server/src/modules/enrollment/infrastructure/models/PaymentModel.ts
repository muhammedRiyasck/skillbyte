import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  stripePaymentIntentId?: string;
  paypalOrderId?: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
  instructorId: mongoose.Types.ObjectId;
  adminFee: number;
  instructorAmount: number;
  convertedAmount?: number;
  convertedCurrency?: string;
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
    stripePaymentIntentId: { type: String },
    paypalOrderId: { type: String },
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
    convertedAmount: { type: Number },
    convertedCurrency: { type: String },
  },
  { timestamps: true },
);

// Use partialFilterExpression to only enforce uniqueness if the field is present and not null
PaymentSchema.index(
  { stripePaymentIntentId: 1 },
  {
    unique: true,
    partialFilterExpression: { stripePaymentIntentId: { $type: 'string' } },
  },
);

PaymentSchema.index(
  { paypalOrderId: 1 },
  {
    unique: true,
    partialFilterExpression: { paypalOrderId: { $type: 'string' } },
  },
);

export const PaymentModel = mongoose.model<IPayment>('Payment', PaymentSchema);
