import { Job } from 'bull';
import { jobQueueService } from '../JobQueueService';
import { MentorshipCleanupJobData, JOB_NAMES, QUEUE_NAMES } from '../JobTypes';
import { ICancelBookingUseCase } from '../../../../modules/mentorship/application/interfaces/IBookingUseCases';
import { IMentorshipBookingRepository } from '../../../../modules/mentorship/domain/IRepositories/IMentorshipBookingRepository';
import { IPaymentReadRepository } from '../../../../modules/payment/domain/IRepositories/IPaymentReadRepository';
import { IStripeProvider } from '../../payment/interfaces/IStripeProvider';
import logger from '../../../utils/Logger';
import { BookingStatus } from '../../../../modules/mentorship/domain/entities/MentorshipBooking';
import { CancelledBy } from '../../../../modules/mentorship/domain/entities/MentorshipBooking';

export class MentorshipCleanupProcessor {
  constructor(
    private readonly _bookingRepo: IMentorshipBookingRepository,
    private readonly _cancelBookingUC: ICancelBookingUseCase,
    private readonly _paymentReadRepo: IPaymentReadRepository,
    private readonly _stripeProvider: IStripeProvider,
  ) {
    this._registerProcessor();
  }

  private _registerProcessor(): void {
    jobQueueService.processJob(
      QUEUE_NAMES.MENTORSHIP,
      JOB_NAMES.MENTORSHIP_CLEANUP,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this._processCleanup.bind(this) as any,
    );
  }

  private async _processCleanup(
    job: Job<MentorshipCleanupJobData>,
  ): Promise<void> {
    const { bookingId } = job.data;
    try {
      const booking = await this._bookingRepo.findById(bookingId);
      if (!booking) {
        logger.warn(`Cleanup: Booking ${bookingId} not found`);
        return;
      }

      if (booking.status === BookingStatus.PENDING) {
        logger.info(
          `Cleanup: Booking ${bookingId} is still pending after timeout. Cancelling...`,
        );

        // Void the Stripe PaymentIntent BEFORE cancelling the booking so the
        // student can no longer complete payment on an already-expired session.
        if (booking.paymentId) {
          const payment = await this._paymentReadRepo.findById(
            booking.paymentId,
          );
          if (payment?.stripePaymentIntentId) {
            const voided = await this._stripeProvider.cancelPaymentIntent(
              payment.stripePaymentIntentId,
            );
            if (voided) {
              logger.info(
                `Cleanup: Voided Stripe PaymentIntent ${payment.stripePaymentIntentId} for booking ${bookingId}`,
              );
            } else {
              logger.warn(
                `Cleanup: Could not void Stripe PaymentIntent ${payment.stripePaymentIntentId} for booking ${bookingId} (may already be terminal)`,
              );
            }
          }
        }

        await this._cancelBookingUC.execute({
          bookingId,
          cancelledBy: CancelledBy.SYSTEM,
        });
      } else {
        logger.info(
          `Cleanup: Booking ${bookingId} is in status '${booking.status}'. No cleanup needed.`,
        );
      }
    } catch (error) {
      logger.error(`Cleanup failed for booking ${bookingId}:`, error);
      throw error;
    }
  }
}
