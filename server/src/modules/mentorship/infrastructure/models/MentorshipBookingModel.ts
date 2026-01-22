import mongoose from 'mongoose';
import { IMentorshipBookingDoc } from '../types/IMentorshipBookingDoc';

const MentorshipBookingSchema = new mongoose.Schema(
  {
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MentorshipSlot',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instructor',
      required: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    videoRoomId: { type: String, default: null },
    videoRoomUrl: { type: String, default: null },
    scheduledAt: { type: Date, required: true },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancelledBy: {
      type: String,
      enum: ['student', 'instructor', 'system', null],
      default: null,
    },
  },
  { timestamps: true },
);

// Indexes for common queries
MentorshipBookingSchema.index({ studentId: 1, status: 1 });
MentorshipBookingSchema.index({ instructorId: 1, status: 1 });
MentorshipBookingSchema.index({ slotId: 1 });
MentorshipBookingSchema.index({ scheduledAt: 1 });
MentorshipBookingSchema.index({ paymentId: 1 });

export const MentorshipBookingModel = mongoose.model<IMentorshipBookingDoc>(
  'MentorshipBooking',
  MentorshipBookingSchema,
);
