import { jobQueueService } from '../../../../shared/services/job-queue/JobQueueService';
import {
  JOB_NAMES,
  QUEUE_NAMES,
} from '../../../../shared/services/job-queue/JobTypes';
import { ResumeUploadProcessor } from '../../../../shared/services/job-queue/processors/ResumeUploadProcessor';
import { DeleteDeclinedInstructorProcessor } from '../../../../shared/services/job-queue/processors/DeleteDeclinedInstructorProcessor';
import { InstructorRepository } from '../../infrastructure/repositories/InstructorRepository';
import { S3StorageService } from '../../../../shared/services/file-upload/services/S3StorageService';
import { eventBus } from '../../../../shared/services/event-bus/EventBus';
import {
  INSTRUCTOR_EVENTS,
  ResumeUploadRequestedEvent,
} from '../../../../shared/services/event-bus/InstructorEvents';
import logger from '../../../../shared/utils/Logger';

/**
 * Registers all background job processors and event-bus subscriptions
 * that belong to the Instructor module.
 *
 * Call once at application startup (after the DI container is ready).
 * Keeping this inside the instructor module means JobQueueInitializer
 * no longer needs to know about instructor-domain internals (OCP).
 */
export function registerInstructorJobs(): void {
  const instructorRepo = new InstructorRepository();
  const s3StorageService = new S3StorageService();

  // Wire processors – each constructor self-registers via jobQueueService
  new ResumeUploadProcessor(instructorRepo, s3StorageService);
  new DeleteDeclinedInstructorProcessor(instructorRepo, s3StorageService);

  // Subscribe to domain event → enqueue resume-upload job
  eventBus.on(
    INSTRUCTOR_EVENTS.RESUME_UPLOAD_REQUESTED,
    (event: ResumeUploadRequestedEvent) => {
      jobQueueService
        .addJob(QUEUE_NAMES.INSTRUCTOR_REGISTRATION, JOB_NAMES.RESUME_UPLOAD, {
          instructorId: event.instructorId,
          filePath: event.filePath,
          originalName: event.originalName,
          email: event.email,
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .catch((err: any) =>
          logger.error('Failed to enqueue resume-upload job:', err),
        );
    },
  );

  logger.info('Instructor job processors registered');
}
