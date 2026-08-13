import mongoose, { Schema, Document, Types } from 'mongoose';

import { WithdrawalStatus } from '../../domain/entities/Withdrawal';

export interface IWithdrawalDocument extends Document {
  instructorId: Types.ObjectId;
  amount: number;
  currency: string;
  status: WithdrawalStatus;
  payoutMethod: 'STRIPE';
  payoutDetails: string; // Stripe Account ID
  transactionId?: string;
  notes?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalSchema = new Schema(
  {
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: 'Instructor',
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: Object.values(WithdrawalStatus),
      default: WithdrawalStatus.PENDING,
    },
    payoutMethod: { type: String, enum: ['STRIPE'], required: true },
    payoutDetails: { type: String, required: true }, // Stripe Account ID
    transactionId: { type: String, default: null },
    notes: { type: String, default: null },
    adminNotes: { type: String, default: null },
  },
  { timestamps: true },
);

// Add partial unique index to prevent multiple pending/processing withdrawals per instructor
WithdrawalSchema.index(
  { instructorId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: [WithdrawalStatus.PENDING, WithdrawalStatus.PROCESSING] },
    },
    name: 'unique_pending_processing_withdrawal_per_instructor',
  },
);

export const WithdrawalModel = mongoose.model<IWithdrawalDocument>(
  'Withdrawal',
  WithdrawalSchema,
);
