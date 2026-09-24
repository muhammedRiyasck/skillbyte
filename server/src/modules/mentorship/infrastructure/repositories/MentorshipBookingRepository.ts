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

/** Manages database operations for mentorship booking. */
export class MentorshipBookingRepository
  extends BaseRepository<MentorshipBooking, IMentorshipBookingDoc>
  implements IMentorshipBookingRepository
{
  constructor() {
    super(MentorshipBookingModel);
  }

  /**
   * To entity for the MentorshipBooking entity.
   *
   * @param doc - The doc information.
   * @returns The result of the operation.
   */
  toEntity(doc: IMentorshipBookingDoc): MentorshipBooking {
    return MentorshipMapper.toBookingEntity(doc);
  }

  /**
   * Find by student id for the MentorshipBooking entity.
   *
   * @param studentId - The unique identifier for the student.
   * @param page - The page information.
   * @param limit - The limit information.
   * @param status - The status information.
   * @param fromDate - The from date information.
   * @param toDate - The to date information.
   * @returns The result of the operation.
   */
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
      .populate(
        'instructorId',
        'name profilePictureUrl profileImageUrl jobTitle',
      )
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(limit);
    return docs.map((doc) => this.toEntity(doc));
  }

  /**
   * Find by student id and slot id for the MentorshipBooking entity.
   *
   * @param studentId - The unique identifier for the student.
   * @param slotId - The unique identifier for the slot.
   * @returns The result of the operation.
   */
  async findByStudentIdAndSlotId(
    studentId: string,
    slotId: string,
  ): Promise<MentorshipBooking | null> {
    const doc = await this.model
      .findOne({ studentId, slotId })
      .populate('slotId')
      .populate(
        'instructorId',
        'name profilePictureUrl profileImageUrl jobTitle',
      )
      .sort({ createdAt: -1 });
    return doc ? this.toEntity(doc) : null;
  }

  /**
   * Find by instructor id for the MentorshipBooking entity.
   *
   * @param instructorId - The unique identifier for the instructor.
   * @param page - The page information.
   * @param limit - The limit information.
   * @param status - The status information.
   * @returns The result of the operation.
   */
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
      .populate('studentId', 'name email profilePictureUrl profileImageUrl')
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(limit);
    return docs.map((doc) => this.toEntity(doc));
  }

  /**
   * Find by slot id for the MentorshipBooking entity.
   *
   * @param slotId - The unique identifier for the slot.
   * @returns The result of the operation.
   */
  async findBySlotId(slotId: string): Promise<MentorshipBooking[]> {
    const docs = await this.model.find({ slotId });
    return docs.map((doc) => this.toEntity(doc));
  }

  /**
   * Update status for the MentorshipBooking entity.
   *
   * @param bookingId - The unique identifier for the booking.
   * @param status - The status information.
   */
  async updateStatus(bookingId: string, status: BookingStatus): Promise<void> {
    await this.model.findByIdAndUpdate(bookingId, { status });
  }

  /**
   * Set video room for the MentorshipBooking entity.
   *
   * @param bookingId - The unique identifier for the booking.
   * @param videoRoomId - The unique identifier for the videoRoom.
   * @param videoRoomUrl - The unique identifier for the videoRoomUrl.
   */
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

  /**
   * Update payment id for the MentorshipBooking entity.
   *
   * @param bookingId - The unique identifier for the booking.
   * @param paymentId - The unique identifier for the payment.
   */
  async updatePaymentId(bookingId: string, paymentId: string): Promise<void> {
    await this.model.findByIdAndUpdate(bookingId, { paymentId });
  }

  /**
   * Mark as completed for the MentorshipBooking entity.
   *
   * @param bookingId - The unique identifier for the booking.
   */
  async markAsCompleted(bookingId: string): Promise<void> {
    await this.model.findByIdAndUpdate(bookingId, {
      status: 'completed',
      completedAt: new Date(),
    });
  }

  /**
   * Mark as cancelled for the MentorshipBooking entity.
   *
   * @param bookingId - The unique identifier for the booking.
   * @param cancelledBy - The cancelled by information.
   */
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

  /**
   * Find upcoming by student id for the MentorshipBooking entity.
   *
   * @param studentId - The unique identifier for the student.
   * @returns The result of the operation.
   */
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
      .populate(
        'instructorId',
        'name profilePictureUrl profileImageUrl jobTitle',
      )
      .sort({ scheduledAt: 1 });
    return docs.map((doc) => this.toEntity(doc));
  }

  /**
   * Find upcoming by instructor id for the MentorshipBooking entity.
   *
   * @param instructorId - The unique identifier for the instructor.
   * @returns The result of the operation.
   */
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
      .populate('studentId', 'name email profilePictureUrl profileImageUrl')
      .sort({ scheduledAt: 1 })
      .limit(3); // Only need 3 for the dashboard widget
    return docs.map((doc) => this.toEntity(doc));
  }

  /**
   * Count pending by student id for the MentorshipBooking entity.
   *
   * @param studentId - The unique identifier for the student.
   * @returns The result of the operation.
   */
  async countPendingByStudentId(studentId: string): Promise<number> {
    return await this.model.countDocuments({
      studentId,
      status: 'pending',
    });
  }

  /**
   * Find pending by student id for the MentorshipBooking entity.
   *
   * @param studentId - The unique identifier for the student.
   * @returns The result of the operation.
   */
  async findPendingByStudentId(
    studentId: string,
  ): Promise<MentorshipBooking | null> {
    const doc = await this.model
      .findOne({ studentId, status: 'pending' })
      .populate('slotId', 'title scheduledAt duration price currency')
      .sort({ createdAt: -1 });
    return doc ? this.toEntity(doc) : null;
  }

  /**
   * Find stale pending bookings for the MentorshipBooking entity.
   *
   * @param now - The now information.
   * @returns The result of the operation.
   */
  async findStalePendingBookings(now: Date): Promise<MentorshipBooking[]> {
    const docs = await this.model.find({
      status: 'pending',
      scheduledAt: { $lt: now },
    });
    return docs.map((doc) => this.toEntity(doc));
  }

  /**
   * Find confirmed past sessions for the MentorshipBooking entity.
   *
   * @param timeThreshold - The time threshold information.
   * @returns The result of the operation.
   */
  async findConfirmedPastSessions(
    timeThreshold: Date,
  ): Promise<MentorshipBooking[]> {
    const docs = await this.model
      .find({
        status: 'confirmed',
        scheduledAt: { $lt: timeThreshold },
      })
      .populate('slotId')
      .populate('studentId', 'name email profilePictureUrl profileImageUrl')
      .populate(
        'instructorId',
        'name profilePictureUrl profileImageUrl jobTitle',
      );

    return docs.map((doc) => this.toEntity(doc));
  }

  /**
   * Update scheduled at for the MentorshipBooking entity.
   *
   * @param bookingId - The unique identifier for the booking.
   * @param scheduledAt - The scheduled at information.
   * @returns The result of the operation.
   */
  async updateScheduledAt(
    bookingId: string,
    scheduledAt: Date,
  ): Promise<MentorshipBooking | null> {
    const doc = await this.model
      .findByIdAndUpdate(
        bookingId,
        { $set: { scheduledAt, updatedAt: new Date() } },
        { new: true },
      )
      .populate('slotId')
      .populate('studentId', 'name email profilePictureUrl profileImageUrl')
      .populate('instructorId', 'name email profileImageUrl jobTitle');

    return doc ? this.toEntity(doc) : null;
  }

  /**
   * Find by id populated for the MentorshipBooking entity.
   *
   * @param bookingId - The unique identifier for the booking.
   * @returns The result of the operation.
   */
  async findByIdPopulated(
    bookingId: string,
  ): Promise<MentorshipBooking | null> {
    const doc = await this.model
      .findById(bookingId)
      .populate('slotId')
      .populate('studentId', 'name email profilePictureUrl profileImageUrl')
      .populate('instructorId', 'name email profileImageUrl jobTitle');

    return doc ? this.toEntity(doc) : null;
  }
}
