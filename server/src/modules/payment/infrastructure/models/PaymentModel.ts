import mongoose, { Schema } from 'mongoose';
import { IPaymentDocument } from '../types/IPaymentDocument';

const PaymentSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
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
    adminFee: { type: Number, required: true },
    instructorAmount: { type: Number, required: true },
    productName: { type: String, required: true },
    productImage: { type: String },
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

export const PaymentModel = mongoose.model<IPaymentDocument>(
  'Payment',
  PaymentSchema,
);
