import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IMentorshipBookingRepository } from '../../domain/IRepositories/IMentorshipBookingRepository';
import {
  MentorshipBooking,
  BookingStatus,
} from '../../domain/entities/MentorshipBooking';
import { MentorshipBookingModel } from '../models/MentorshipBookingModel';
import { IMentorshipBookingDoc } from '../types/IMentorshipBookingDoc';
import {
  findByInstructorIdQueryType,
  findByStudentIdQueryType,
} from '../types/IQueryTypes';
import { MentorshipMapper } from '../mappers/MentorshipMapper';

export class MentorshipBookingRepository
  extends BaseRepository<MentorshipBooking, IMentorshipBookingDoc>
  implements IMentorshipBookingRepository
{
  constructor() {
    super(MentorshipBookingModel);
  }

  toEntity(doc: IMentorshipBookingDoc): MentorshipBooking {
    return MentorshipMapper.toBookingEntity(doc);
  }

  async findByStudentId(
    studentId: string,
    page: number = 1,
    limit: number = 10,
    status?: BookingStatus,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<MentorshipBooking[]> {
    const skip = (page - 1) * limit;
    const query: findByStudentIdQueryType = { studentId };

    if (status) query.status = status;
    if (fromDate || toDate) {
      query.scheduledAt = {};
      if (fromDate) query.scheduledAt.$gte = fromDate;
      if (toDate) query.scheduledAt.$lte = toDate;
    }

    const docs = await this.model
      .find(query)
      .populate('slotId')
      .populate('instructorId', 'name profileImageUrl jobTitle')
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(limit);
    return docs.map((doc) => this.toEntity(doc));
  }

  async findByInstructorId(
    instructorId: string,
    page: number = 1,
    limit: number = 10,
    status?: BookingStatus,
  ): Promise<MentorshipBooking[]> {
    const skip = (page - 1) * limit;
    const query: findByInstructorIdQueryType = { instructorId };

    if (status) {
      query.status = status;
    }

    const docs = await this.model
      .find(query)
      .populate('slotId')
      .populate('studentId', 'name email profileImageUrl')
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(limit);
    return docs.map((doc) => this.toEntity(doc));
  }

  async findBySlotId(slotId: string): Promise<MentorshipBooking[]> {
    const docs = await this.model.find({ slotId });
    return docs.map((doc) => this.toEntity(doc));
  }

  async updateStatus(bookingId: string, status: BookingStatus): Promise<void> {
    await this.model.findByIdAndUpdate(bookingId, { status });
  }

  async setVideoRoom(
    bookingId: string,
    videoRoomId: string,
    videoRoomUrl: string,
  ): Promise<void> {
    await this.model.findByIdAndUpdate(bookingId, {
      videoRoomId,
      videoRoomUrl,
    });
  }

  async updatePaymentId(bookingId: string, paymentId: string): Promise<void> {
    await this.model.findByIdAndUpdate(bookingId, { paymentId });
  }

  async markAsCompleted(bookingId: string): Promise<void> {
    await this.model.findByIdAndUpdate(bookingId, {
      status: 'completed',
      completedAt: new Date(),
    });
  }

  async markAsCancelled(
    bookingId: string,
    cancelledBy: 'student' | 'instructor' | 'system',
  ): Promise<void> {
    await this.model.findByIdAndUpdate(bookingId, {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy,
    });
  }

  async findUpcomingByStudentId(
    studentId: string,
  ): Promise<MentorshipBooking[]> {
    const docs = await this.model
      .find({
        studentId,
        scheduledAt: { $gt: new Date() },
        status: { $in: ['pending', 'confirmed'] },
      })
      .populate('slotId')
      .populate('instructorId', 'name profileImageUrl jobTitle')
      .sort({ scheduledAt: 1 });
    return docs.map((doc) => this.toEntity(doc));
  }

  async findUpcomingByInstructorId(
    instructorId: string,
  ): Promise<MentorshipBooking[]> {
    const now = new Date();
    // Show sessions from 2 hours ago (catches in-progress) up to 7 days ahead
    const from = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const to = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const docs = await this.model
      .find({
        instructorId,
        scheduledAt: { $gte: from, $lte: to },
        status: 'confirmed',
      })
      .populate('slotId')
      .populate('studentId', 'name email profileImageUrl')
      .sort({ scheduledAt: 1 })
      .limit(3); // Only need 3 for the dashboard widget
    return docs.map((doc) => this.toEntity(doc));
  }

  async countPendingByStudentId(studentId: string): Promise<number> {
    return await this.model.countDocuments({
      studentId,
      status: 'pending',
    });
  }

  async findConfirmedPastSessions(
    timeThreshold: Date,
  ): Promise<MentorshipBooking[]> {
    const docs = await this.model
      .find({
        status: 'confirmed',
        scheduledAt: { $lt: timeThreshold },
      })
      .populate('slotId')
      .populate('studentId', 'name email profileImageUrl')
      .populate('instructorId', 'name profileImageUrl jobTitle');

    return docs.map((doc) => this.toEntity(doc));
  }
}
