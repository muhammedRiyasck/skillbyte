import { IMentorshipBookingRepository } from '../../domain/IRepositories/IMentorshipBookingRepository';
import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import { BookingStatus } from '../../domain/entities/MentorshipBooking';
import { RescheduleBookingDto } from '../dtos/BookingDto';
import { BookingResponseDto } from '../dtos/BookingResponseDto';
import { BookingResponseMapper } from '../mappers/BookingResponseMapper';
import { IRescheduleBookingUseCase } from '../interfaces/IBookingUseCases';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { sessionRescheduledEmailTemplate } from '../../../../shared/templates/SessionRescheduled';
import {
  EmailJobData,
  JOB_NAMES,
  QUEUE_NAMES,
} from '../../../../shared/services/job-queue/JobTypes';
import { jobQueueService } from '../../../../shared/services/job-queue/JobQueueService';
import logger from '../../../../shared/utils/Logger';

/**
 * Use case for instructors to reschedule confirmed bookings without conflict.
 */
export class RescheduleBookingUseCase implements IRescheduleBookingUseCase {
  constructor(
    private _bookingRepo: IMentorshipBookingRepository,
    private _slotRepo: IMentorshipSlotRepository,
  ) {}

  async execute(dto: RescheduleBookingDto): Promise<BookingResponseDto> {
    const { bookingId, instructorId, newScheduledAt, reason } = dto;

    // 1. Fetch booking with populated relations
    const booking = await this._bookingRepo.findByIdPopulated(bookingId);
    if (!booking) {
      throw new HttpError('Booking not found', HttpStatusCode.NOT_FOUND);
    }

    // 2. Validate booking status
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new HttpError(
        `Cannot reschedule a booking with status '${booking.status}'. Only confirmed bookings can be rescheduled.`,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // 3. Validate authorization
    if (booking.instructorId !== instructorId) {
      throw new HttpError(
        'You are not authorized to reschedule this session',
        HttpStatusCode.FORBIDDEN,
      );
    }

    // 4. Validate future time
    const now = new Date();
    const newTime = new Date(newScheduledAt);
    if (isNaN(newTime.getTime()) || newTime <= now) {
      throw new HttpError(
        'New scheduled time must be in the future',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // 5. Fetch associated slot to retrieve duration and session info
    const existingSlot = await this._slotRepo.findById(booking.slotId);
    if (!existingSlot) {
      throw new HttpError(
        'Associated slot not found',
        HttpStatusCode.NOT_FOUND,
      );
    }

    // 6. Conflict detection: check if instructor has any other slot/session during this window
    const durationMinutes = existingSlot.duration;
    const newEndTime = new Date(newTime.getTime() + durationMinutes * 60000);

    const hasConflict = await this._slotRepo.hasOverlappingSlot(
      instructorId,
      newTime,
      newEndTime,
      booking.slotId,
    );

    if (hasConflict) {
      throw new HttpError(
        'You already have an active slot or session scheduled during this time period.',
        HttpStatusCode.CONFLICT,
      );
    }

    // 7. Update slot's scheduled time
    existingSlot.scheduledAt = newTime;
    existingSlot.updatedAt = new Date();
    await this._slotRepo.save(existingSlot);

    // 8. Update booking's scheduled time atomically
    const updatedBooking = await this._bookingRepo.updateScheduledAt(
      bookingId,
      newTime,
    );

    if (!updatedBooking) {
      throw new HttpError(
        'Failed to update booking schedule',
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    // 9. Send email notification to student via job queue
    const studentEmail = updatedBooking.studentDetails?.email;
    const studentName = updatedBooking.studentDetails?.name || 'Student';
    const instructorName =
      updatedBooking.instructorDetails?.name || 'Instructor';
    const sessionTitle = existingSlot.title;

    if (studentEmail) {
      try {
        const emailHtml = sessionRescheduledEmailTemplate(
          studentName,
          instructorName,
          sessionTitle,
          booking.scheduledAt,
          newTime,
          booking.videoRoomUrl ?? undefined,
          reason,
        );

        const emailData: EmailJobData = {
          to: studentEmail,
          subject: `📅 Mentorship Session Rescheduled: ${sessionTitle}`,
          html: emailHtml,
        };

        await jobQueueService.addJob(
          QUEUE_NAMES.EMAIL,
          JOB_NAMES.SEND_EMAIL,
          emailData,
        );
      } catch (emailErr) {
        logger.error(
          `Failed to enqueue session rescheduled email for booking ${bookingId}:`,
          emailErr,
        );
      }
    }

    return BookingResponseMapper.toResponseDto(updatedBooking);
  }
}
