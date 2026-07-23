import { IMentorshipBookingRepository } from '../../domain/IRepositories/IMentorshipBookingRepository';
import logger from '../../../../shared/utils/Logger';
import { IAutoCompleteBookingsUseCase } from '../interfaces/IBookingUseCases';
import { ICancelBookingUseCase } from '../interfaces/IBookingUseCases';
import { CancelledBy } from '../../domain/entities/MentorshipBooking';

export class AutoCompleteBookingsUseCase
  implements IAutoCompleteBookingsUseCase
{
  constructor(
    private bookingRepo: IMentorshipBookingRepository,
    private cancelBookingUC: ICancelBookingUseCase,
  ) {}

  async execute(): Promise<void> {
    await Promise.all([
      this._autoCompleteConfirmedSessions(),
      this._sweepStalePendingBookings(),
    ]);
  }

  /**
   * Marks CONFIRMED sessions whose scheduledAt + 2h buffer has passed as COMPLETED.
   */
  private async _autoCompleteConfirmedSessions(): Promise<void> {
    try {
      const timeThreshold = new Date();
      timeThreshold.setHours(timeThreshold.getHours() - 2);

      const bookingsToComplete =
        await this.bookingRepo.findConfirmedPastSessions(timeThreshold);

      if (bookingsToComplete.length === 0) return;

      logger.info(
        `Auto-completing ${bookingsToComplete.length} mentorship bookings`,
      );

      for (const booking of bookingsToComplete) {
        await this.bookingRepo.markAsCompleted(booking.bookingId!);
        logger.info(`Auto-completed booking ${booking.bookingId}`);
      }
    } catch (error) {
      logger.error('Failed in AutoCompleteBookingsUseCase (complete):', error);
    }
  }

  /**
   * Cancels PENDING bookings whose scheduledAt has already passed — these are
   * orphaned bookings where the 20-min per-booking cleanup job was missed
   * (e.g. server restart, Redis data loss). Runs as a safety-net sweep.
   */
  private async _sweepStalePendingBookings(): Promise<void> {
    try {
      const now = new Date();
      const stale = await this.bookingRepo.findStalePendingBookings(now);

      if (stale.length === 0) return;

      logger.info(
        `Sweeping ${stale.length} stale PENDING bookings whose session time has passed`,
      );

      for (const booking of stale) {
        try {
          await this.cancelBookingUC.execute({
            bookingId: booking.bookingId!,
            cancelledBy: CancelledBy.SYSTEM,
          });
          logger.info(
            `Sweep: Cancelled stale pending booking ${booking.bookingId}`,
          );
        } catch (err) {
          // Log individual failure but continue sweeping the rest
          logger.error(
            `Sweep: Failed to cancel stale booking ${booking.bookingId}:`,
            err,
          );
        }
      }
    } catch (error) {
      logger.error('Failed in AutoCompleteBookingsUseCase (sweep):', error);
    }
  }
}
