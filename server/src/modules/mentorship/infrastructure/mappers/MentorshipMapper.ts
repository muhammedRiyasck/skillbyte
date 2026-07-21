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
  private static extractId(field: unknown): string {
    if (!field) return '';
    if (field instanceof Types.ObjectId) return field.toString();
    if (typeof field === 'object' && field !== null && '_id' in field) {
      return String((field as { _id: unknown })._id);
    }
    return String(field);
  }

  static toBookingEntity(doc: IMentorshipBookingDoc): MentorshipBooking {
    const entity = new MentorshipBooking(
      MentorshipMapper.extractId(doc.slotId),
      MentorshipMapper.extractId(doc.studentId),
      MentorshipMapper.extractId(doc.instructorId),
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

    if (
      doc.studentId &&
      typeof doc.studentId === 'object' &&
      'name' in doc.studentId
    ) {
      const student = doc.studentId as unknown as {
        name: string;
        email: string;
        profileImageUrl?: string;
      };
      entity.studentDetails = {
        name: student.name,
        email: student.email,
        profileImageUrl: student.profileImageUrl,
      };
    }

    if (
      doc.slotId &&
      typeof doc.slotId === 'object' &&
      'duration' in doc.slotId
    ) {
      const slot = doc.slotId as unknown as { duration: number; title: string };
      entity.slotDetails = {
        duration: slot.duration,
        title: slot.title,
      };
    }

    return entity;
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
