import { CreateSlotDto, UpdateSlotDto } from '../dtos/SlotDto';
import {
  MentorshipBooking,
  BookingStatus,
} from '../../domain/entities/MentorshipBooking';
import {
  MentorshipSlot,
  SlotStatus,
} from '../../domain/entities/MentorshipSlot';
import { IMentorshipBookingDoc } from '../../infrastructure/types/IMentorshipBookingDoc';
import { IMentorshipSlotDoc } from '../../infrastructure/types/IMentorshipSlotDoc';
import { Types } from 'mongoose';

export class MentorshipMapper {
  static toCreateSlotDto(
    data: CreateSlotDto,
    instructorId: string,
  ): CreateSlotDto {
    return {
      instructorId,
      title: data.title,
      description: data.description,
      duration: data.duration,
      price: data.price,
      currency: data.currency,
      scheduledAt: new Date(data.scheduledAt),
      jobTitle: data.jobTitle,
      tags: data.tags,
      timezone: data.timezone,
    };
  }

  static toUpdateSlotDto(data: UpdateSlotDto): UpdateSlotDto {
    return {
      title: data.title,
      description: data.description,
      duration: data.duration,
      price: data.price,
      currency: data.currency,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      jobTitle: data.jobTitle,
      tags: data.tags,
      timezone: data.timezone,
    };
  }

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
