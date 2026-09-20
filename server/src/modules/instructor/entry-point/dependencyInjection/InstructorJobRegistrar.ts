import { DeleteDeclinedInstructorProcessor } from '../../../../shared/services/job-queue/processors/DeleteDeclinedInstructorProcessor';
import { InstructorRepository } from '../../infrastructure/repositories/InstructorRepository';
import { S3StorageService } from '../../../../shared/services/file-upload/services/S3StorageService';
import logger from '../../../../shared/utils/Logger';

/**
 * Registers all background job processors that belong to the Instructor module.
 *
 * NOTE: ResumeUploadProcessor has been retired — resume files are now uploaded
 * directly to S3 in the controller (fire-and-forget) and the key is stored in
 * Redis. No job-queue step is needed for registration uploads.
 *
 * Call once at application startup (after the DI container is ready).
 */
export function registerInstructorJobs(): void {
  const instructorRepo = new InstructorRepository();
  const s3StorageService = new S3StorageService();

  // Wire remaining processors
  new DeleteDeclinedInstructorProcessor(instructorRepo, s3StorageService);

  logger.info('Instructor job processors registered');
}
