import { Document, Types } from 'mongoose';
import { SlotStatus } from '../../domain/entities/MentorshipSlot';
export interface IMentorshipSlotDoc extends Document {
  _id: Types.ObjectId;
  instructorId: Types.ObjectId;
  title: string;
  description: string;
  duration: 30 | 45 | 60 | 90;
  price: number;
  currency: string;
  scheduledAt: Date;
  status: SlotStatus;
  maxBookings: number;
  currentBookings: number;
  jobTitle: string;
  tags: string[];
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}
