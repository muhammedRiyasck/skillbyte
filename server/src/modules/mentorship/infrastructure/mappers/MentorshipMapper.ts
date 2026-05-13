import { Types } from 'mongoose';
import {
  MentorshipBooking,
  BookingStatus,
} from '../../domain/entities/MentorshipBooking';
import {
  MentorshipSlot,
  SlotStatus,
} from '../../domain/entities/MentorshipSlot';
import { IMentorshipBookingDoc } from '../types/IMentorshipBookingDoc';
import { IMentorshipSlotDoc } from '../types/IMentorshipSlotDoc';

export class MentorshipMapper {
  static toBookingEntity(doc: IMentorshipBookingDoc): MentorshipBooking {
    return new MentorshipBooking(
      doc.slotId instanceof Types.ObjectId ? doc.slotId.toString() : doc.slotId,
      doc.studentId instanceof Types.ObjectId
        ? doc.studentId.toString()
        : doc.studentId,
      doc.instructorId instanceof Types.ObjectId
        ? doc.instructorId.toString()
        : doc.instructorId,
      doc.paymentId ? doc.paymentId.toString() : null,
      doc.amount,
      doc.currency,
      doc.status as BookingStatus,
      doc.videoRoomId,
      doc.videoRoomUrl,
      doc.scheduledAt,
      doc.completedAt,
      doc.cancelledAt,
      doc.cancelledBy,
      doc._id.toString(),
      doc.createdAt,
      doc.updatedAt,
    );
  }

  static toSlotEntity(doc: IMentorshipSlotDoc): MentorshipSlot {
    const entity = new MentorshipSlot(
      doc.instructorId as string,
      doc.title,
      doc.description,
      doc.duration,
      doc.price,
      doc.currency,
      doc.scheduledAt,
      doc.status as SlotStatus,
      doc.maxBookings,
      doc.currentBookings,
      doc.jobTitle,
      doc.tags,
      doc.timezone,
      doc._id.toString(),
    );

    // populated instructor details
    if (
      doc.instructorId &&
      typeof doc.instructorId === 'object' &&
      'name' in doc.instructorId
    ) {
      const ins = doc.instructorId as {
        name: string;
        profilePictureUrl?: string;
        jobTitle: string;
        averageRating?: number;
        totalReviews?: number;
      };
      entity.instructorDetails = {
        name: ins.name,
        profilePictureUrl: ins.profilePictureUrl,
        jobTitle: ins.jobTitle,
        averageRating: ins.averageRating,
        totalReviews: ins.totalReviews,
      };
    }

    entity.createdAt = doc.createdAt;
    entity.updatedAt = doc.updatedAt;

    return entity;
  }
}
