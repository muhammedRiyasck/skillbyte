import { IMentorshipBookingRepository } from '../../domain/IRepositories/IMentorshipBookingRepository';
import logger from '../../../../shared/utils/Logger';
import { IAutoCompleteBookingsUseCase } from '../interfaces/IBookingUseCases';

export class AutoCompleteBookingsUseCase
  implements IAutoCompleteBookingsUseCase
{
  constructor(private bookingRepo: IMentorshipBookingRepository) {}

  async execute(): Promise<void> {
    try {
      // Find all CONFIRMED bookings where the scheduledAt time has passed
      // We will add a small buffer (e.g., 2 hours) to ensure the session duration has also passed
      const timeThreshold = new Date();
      timeThreshold.setHours(timeThreshold.getHours() - 2);

      const bookingsToComplete =
        await this.bookingRepo.findConfirmedPastSessions(timeThreshold);

      if (bookingsToComplete.length === 0) {
        return; // Nothing to process
      }

      logger.info(
        `Auto-completing ${bookingsToComplete.length} mentorship bookings`,
      );

      for (const booking of bookingsToComplete) {
        await this.bookingRepo.markAsCompleted(booking.bookingId!);
        logger.info(`Auto-completed booking ${booking.bookingId}`);
      }
    } catch (error) {
      logger.error('Failed in AutoCompleteBookingsUseCase:', error);
      throw error;
    }
  }
}
