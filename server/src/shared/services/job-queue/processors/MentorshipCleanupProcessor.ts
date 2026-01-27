import { Job } from 'bull';
import { jobQueueService } from '../JobQueueService';
import { MentorshipCleanupJobData, JOB_NAMES, QUEUE_NAMES } from '../JobTypes';
import { ICancelBookingUseCase } from '../../../../modules/mentorship/application/interfaces/IBookingUseCases';
import { IMentorshipBookingRepository } from '../../../../modules/mentorship/domain/IRepositories/IMentorshipBookingRepository';
import logger from '../../../utils/Logger';

export class MentorshipCleanupProcessor {
  constructor(
    private readonly _bookingRepo: IMentorshipBookingRepository,
    private readonly _cancelBookingUC: ICancelBookingUseCase,
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

      if (booking.status === 'pending') {
        logger.info(
          `Cleanup: Booking ${bookingId} is still pending after timeout. Cancelling...`,
        );
        await this._cancelBookingUC.execute({
          bookingId,
          cancelledBy: 'system',
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
