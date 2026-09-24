import { jobQueueService } from '../../../../shared/services/job-queue/JobQueueService';
import {
  JOB_NAMES,
  QUEUE_NAMES,
} from '../../../../shared/services/job-queue/JobTypes';
import { MentorshipCleanupProcessor } from '../../../../shared/services/job-queue/processors/MentorshipCleanupProcessor';
import { MentorshipAutoCompleteProcessor } from '../../../../shared/services/job-queue/processors/MentorshipAutoCompleteProcessor';
import {
  bookingRepository,
  cancelBookingUC,
  autoCompleteBookingsUC,
  stripeProvider,
  paymentReadRepository,
} from './MentorshipContainer';
import { eventBus } from '../../../../shared/services/event-bus/EventBus';
import {
  MENTORSHIP_EVENTS,
  MentorshipBookingCreatedPendingEvent,
} from '../../../../shared/services/event-bus/MentorshipEvents';
import logger from '../../../../shared/utils/Logger';

/**
 * Registers all background job processors and recurring jobs
 * that belong to the Mentorship module.
 *
 * Keeping this inside the mentorship module means JobQueueInitializer
 * no longer needs to import MentorshipContainer or know about
 * mentorship-domain internals (OCP / SRP).
 */
export function registerMentorshipJobs(): void {
  // Wire processors – each constructor self-registers via jobQueueService
  new MentorshipCleanupProcessor(
    bookingRepository,
    cancelBookingUC,
    paymentReadRepository,
    stripeProvider,
  );

  new MentorshipAutoCompleteProcessor(autoCompleteBookingsUC);

  // Subscribe to pending booking creation → schedule cleanup job after timeout
  eventBus.on(
    MENTORSHIP_EVENTS.BOOKING_CREATED_PENDING,
    (event: MentorshipBookingCreatedPendingEvent) => {
      jobQueueService
        .addJob(
          QUEUE_NAMES.MENTORSHIP,
          JOB_NAMES.MENTORSHIP_CLEANUP,
          { bookingId: event.bookingId },
          { delay: event.delayMs },
        )
        .catch((err: unknown) =>
          logger.error(
            `Failed to enqueue mentorship cleanup job for booking ${event.bookingId}:`,
            err,
          ),
        );
    },
  );

  // Schedule recurring auto-completion (every 30 minutes)
  jobQueueService
    .registerRecurringJob(
      QUEUE_NAMES.MENTORSHIP,
      JOB_NAMES.MENTORSHIP_AUTO_COMPLETE,
      '*/30 * * * *',
      {},
      'mentorship-auto-complete-singleton',
    )
    .catch((err: unknown) =>
      logger.error('Failed to register mentorship auto-complete cron:', err),
    );

  logger.info('Mentorship job processors registered');
}
