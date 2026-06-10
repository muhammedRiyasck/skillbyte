import { IValidateVideoRoomAccessUseCase } from '../interfaces/IBookingUseCases';
import { ValidateVideoRoomAccessDto } from '../dtos/BookingDto';
import { IMentorshipBookingRepository } from '../../domain/IRepositories/IMentorshipBookingRepository';
import logger from '../../../../shared/utils/Logger';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { UserRole } from '../../../../shared/enums/UserRole';
import { BookingStatus } from '../../domain/entities/MentorshipBooking';

export class ValidateVideoRoomAccessUseCase
  implements IValidateVideoRoomAccessUseCase
{
  // Allow joining 15 minutes before scheduled time
  private readonly EARLY_JOIN_MINUTES = 15;
  // Allow joining up to duration + 30 minutes after scheduled time
  private readonly LATE_JOIN_BUFFER_MINUTES = 30;

  constructor(private bookingRepo: IMentorshipBookingRepository) {}

  async execute(
    dto: ValidateVideoRoomAccessDto,
  ): Promise<{ bookingId: string; isValid: boolean; status?: string }> {
    const { roomId, userId, userRole } = dto;
    logger.info(
      `Validating video room access: roomId=${roomId}, userId=${userId}, role=${userRole}`,
    );

    // Extract booking ID from room ID (format: skillbyte-mentorship-{bookingId}-{random})
    const bookingId = this.extractBookingIdFromRoomId(roomId);
    if (!bookingId) {
      throw new HttpError('Invalid room ID format', HttpStatusCode.BAD_REQUEST);
    }

    // Get booking
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new HttpError('Booking not found', HttpStatusCode.NOT_FOUND);
    }

    // Verify room ID matches
    if (booking.videoRoomId !== roomId) {
      throw new HttpError(
        'Room ID does not match booking',
        HttpStatusCode.FORBIDDEN,
      );
    }

    // Verify booking is confirmed
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new HttpError(
        `Cannot join video room: booking status is ${booking.status}`,
        HttpStatusCode.FORBIDDEN,
      );
    }

    // Verify user is participant
    const isStudent =
      userRole === UserRole.STUDENT && booking.studentId === userId;
    const isInstructor =
      userRole === UserRole.INSTRUCTOR && booking.instructorId === userId;

    if (!isStudent && !isInstructor) {
      throw new HttpError(
        'You are not a participant in this session',
        HttpStatusCode.FORBIDDEN,
      );
    }

    // Verify time window
    const now = new Date();
    const scheduledAt = new Date(booking.scheduledAt);
    const earlyJoinTime = new Date(
      scheduledAt.getTime() - this.EARLY_JOIN_MINUTES * 60 * 1000,
    );

    // Get slot duration (assuming you have this in booking or need to fetch slot)
    // For now, using a default of 60 minutes if not available
    const durationMinutes = 60; // TODO: Get from slot if needed
    const lateJoinTime = new Date(
      scheduledAt.getTime() +
        (durationMinutes + this.LATE_JOIN_BUFFER_MINUTES) * 60 * 1000,
    );

    if (now < earlyJoinTime) {
      throw new HttpError(
        `Session can be joined ${this.EARLY_JOIN_MINUTES} minutes before scheduled time`,
        HttpStatusCode.FORBIDDEN,
      );
    }

    if (now > lateJoinTime) {
      throw new HttpError('Session time has expired', HttpStatusCode.FORBIDDEN);
    }

    logger.info(`Video room access validated for user ${userId}`);
    return {
      bookingId,
      isValid: true,
      status: booking.status as BookingStatus,
    };
  }

  private extractBookingIdFromRoomId(roomId: string): string | null {
    // Format: skillbyte-mentorship-{bookingId}-{random}
    const parts = roomId.split('-');
    if (
      parts.length >= 4 &&
      parts[0] === 'skillbyte' &&
      parts[1] === 'mentorship'
    ) {
      // Join all parts except first 2 and last 1
      return parts.slice(2, -1).join('-');
    }
    return null;
  }
}
