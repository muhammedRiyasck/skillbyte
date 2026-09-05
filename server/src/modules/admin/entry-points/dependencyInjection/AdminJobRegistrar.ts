import { jobQueueService } from '../../../../shared/services/job-queue/JobQueueService';
import {
  JOB_NAMES,
  QUEUE_NAMES,
} from '../../../../shared/services/job-queue/JobTypes';
import { TopInstructorProcessor } from '../../../../shared/services/job-queue/processors/TopInstructorProcessor';
import { RefreshTopInstructorsUseCase } from '../../application/use-cases/RefreshTopInstructorsUseCase';
import { InstructorRepository } from '../../../instructor/infrastructure/repositories/InstructorRepository';
import { TopInstructorRepository } from '../../infrastructure/repositories/TopInstructorRepository';
import logger from '../../../../shared/utils/Logger';

/**
 * Registers all background job processors and recurring jobs
 * that belong to the Admin module.
 *
 * Keeping this inside the admin module means JobQueueInitializer no longer
 * needs to know about admin-domain internals (OCP / SRP).
 */
export function registerAdminJobs(): void {
  const instructorRepo = new InstructorRepository();
  const topInstructorRepository = new TopInstructorRepository();

  const refreshTopInstructorsUseCase = new RefreshTopInstructorsUseCase(
    instructorRepo,
    topInstructorRepository,
  );

  // Wire processor – constructor self-registers via jobQueueService
  new TopInstructorProcessor(refreshTopInstructorsUseCase);

  // Schedule recurring job to refresh top instructors (every 1 hour)
  jobQueueService
    .registerRecurringJob(
      QUEUE_NAMES.CLEANUP,
      JOB_NAMES.REFRESH_TOP_INSTRUCTORS,
      '0 * * * *',
      {},
      'refresh-top-instructors-singleton',
    )
    .catch(
      (
        err: any, // eslint-disable-line @typescript-eslint/no-explicit-any
      ) =>
        logger.error('Failed to register refresh-top-instructors cron:', err),
    );

  // Seed the capped collection immediately on startup
  refreshTopInstructorsUseCase.execute().catch((err) => {
    logger.error('Failed to seed top instructors on startup:', err);
  });

  logger.info('Admin job processors registered');
}
