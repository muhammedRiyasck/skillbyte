import { jobQueueService } from './JobQueueService';
import { ResumeUploadProcessor } from './processors/ResumeUploadProcessor';
import { EmailProcessor } from './processors/EmailProcessor';
import { MongoInstructorRepository } from '../../../modules/instructor/infrastructure/repositories/MongoInstructorRepository';
import logger from '../../utils/Logger';
import { DeleteDeclinedInstructorProcessor } from './processors/DeleteDeclinedInstructorProcessor';

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
      const instructorRepo = new MongoInstructorRepository();
      new ResumeUploadProcessor(instructorRepo);
      new EmailProcessor();
      new DeleteDeclinedInstructorProcessor(instructorRepo);

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
