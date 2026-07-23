import { jobQueueService } from './JobQueueService';
import { ResumeUploadProcessor } from './processors/ResumeUploadProcessor';
import { EmailProcessor } from './processors/EmailProcessor';
import { InstructorRepository } from '../../../modules/instructor/infrastructure/repositories/InstructorRepository';
import logger from '../../utils/Logger';
import { DeleteDeclinedInstructorProcessor } from './processors/DeleteDeclinedInstructorProcessor';
import { S3StorageService } from '../file-upload/services/S3StorageService';
import { MentorshipCleanupProcessor } from './processors/MentorshipCleanupProcessor';
import { MentorshipAutoCompleteProcessor } from './processors/MentorshipAutoCompleteProcessor';
import {
  bookingRepository,
  cancelBookingUC,
  autoCompleteBookingsUC,
  stripeProvider,
  paymentReadRepository,
} from '../../../modules/mentorship/entry-point/dependencyInjection/MentorshipContainer';
import { NodeMailerService } from '../mail/NodeMailerService';
import { JOB_NAMES, QUEUE_NAMES } from './JobTypes';
import { TopInstructorProcessor } from './processors/TopInstructorProcessor';
import { RefreshTopInstructorsUseCase } from '../../../modules/admin/application/use-cases/RefreshTopInstructorsUseCase';
import { TopInstructorRepository } from '../../../modules/admin/infrastructure/repositories/TopInstructorRepository';

/**
 * Initializes job queue processors and services
 */
export class JobQueueInitializer {
  private static _initialized = false;

  static initialize(): void {
    if (this._initialized) {
      logger.info('Job queue already initialized');
      return;
    }

    try {
      // Initialize processors
      const instructorRepo = new InstructorRepository();
      const s3StorageService = new S3StorageService();
      const nodeMailer = new NodeMailerService();
      new ResumeUploadProcessor(instructorRepo, s3StorageService);
      new EmailProcessor(nodeMailer);
      new DeleteDeclinedInstructorProcessor(instructorRepo, s3StorageService);
      new MentorshipCleanupProcessor(
        bookingRepository,
        cancelBookingUC,
        paymentReadRepository,
        stripeProvider,
      );
      new MentorshipAutoCompleteProcessor(autoCompleteBookingsUC);

      // Schedule repeatable job for auto-completion (every 30 minutes)
      jobQueueService.addJob(
        QUEUE_NAMES.MENTORSHIP,
        JOB_NAMES.MENTORSHIP_AUTO_COMPLETE,
        {},
        {
          repeat: { cron: '*/30 * * * *' },
          jobId: 'mentorship-auto-complete-singleton', // Ensure only one instance exists
        },
      );

      const topInstructorRepository = new TopInstructorRepository();
      const refreshTopInstructorsUseCase = new RefreshTopInstructorsUseCase(
        instructorRepo,
        topInstructorRepository,
      );
      new TopInstructorProcessor(refreshTopInstructorsUseCase);

      // Schedule repeatable job to refresh top instructors (every 1 hour)
      jobQueueService.addJob(
        QUEUE_NAMES.CLEANUP,
        JOB_NAMES.REFRESH_TOP_INSTRUCTORS,
        {},
        {
          repeat: { cron: '0 * * * *' }, // Run at minute 0 of every hour
          jobId: 'refresh-top-instructors-singleton',
        },
      );

      // Execute immediately on startup to seed the capped collection
      refreshTopInstructorsUseCase.execute().catch((err) => {
        logger.error('Failed to seed top instructors on startup:', err);
      });

      logger.info('Job queue processors initialized successfully');
      this._initialized = true;
    } catch (error) {
      logger.info('Failed to initialize job queue processors:', error);
      throw error;
    }
  }

  static async close(): Promise<void> {
    if (this._initialized) {
      await jobQueueService.closeAll();
      this._initialized = false;
      logger.info('Job queue closed');
    }
  }
}
