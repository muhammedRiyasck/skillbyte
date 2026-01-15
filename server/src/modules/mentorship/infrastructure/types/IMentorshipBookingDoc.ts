import type {
  BookingStatus,
  CancelledBy,
} from '../../domain/entities/MentorshipBooking';
import { Types, Document } from 'mongoose';

export interface IMentorshipBookingDoc extends Document {
  _id: Types.ObjectId;
  slotId: Types.ObjectId;
  studentId: Types.ObjectId;
  instructorId: Types.ObjectId;
  paymentId: Types.ObjectId;
  amount: number;
  currency: string;
  status: BookingStatus;
  videoRoomId: string | null;
  videoRoomUrl: string | null;
  scheduledAt: Date;
  completedAt: Date | null;
  cancelledAt: Date | null;
  cancelledBy: CancelledBy;
  createdAt: Date;
  updatedAt: Date;
}
