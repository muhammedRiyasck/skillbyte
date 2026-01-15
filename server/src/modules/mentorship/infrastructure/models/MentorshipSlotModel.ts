import mongoose from 'mongoose';
import { IMentorshipSlotDoc } from '../types/IMentorshipSlotDoc';

const MentorshipSlotSchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instructor',
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: {
      type: Number,
      enum: [30, 45, 60, 90],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'INR' },
    scheduledAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['available', 'booked', 'completed', 'cancelled'],
      default: 'available',
    },
    maxBookings: { type: Number, default: 1 },
    currentBookings: { type: Number, default: 0 },
    jobTitle: { type: String, required: true },
    tags: [{ type: String }],
    timezone: { type: String, default: 'UTC' },
  },
  { timestamps: true },
);

// Indexes for common queries
MentorshipSlotSchema.index({ instructorId: 1 });
MentorshipSlotSchema.index({ status: 1, scheduledAt: 1 });
MentorshipSlotSchema.index({ jobTitle: 1, status: 1 });
MentorshipSlotSchema.index({ scheduledAt: 1 });

export const MentorshipSlotModel = mongoose.model<IMentorshipSlotDoc>(
  'MentorshipSlot',
  MentorshipSlotSchema,
);
