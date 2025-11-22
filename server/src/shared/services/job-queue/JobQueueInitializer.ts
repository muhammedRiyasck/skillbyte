import { jobQueueService } from './JobQueueService';
import { ResumeUploadProcessor } from './processors/ResumeUploadProcessor';
import { EmailProcessor } from './processors/EmailProcessor';
import { MongoInstructorRepository } from '../../../modules/instructor/infrastructure/repositories/MongoInstructorRepository';
import logger from '../../utils/Logger';

/**
 * Initializes job queue processors and services
 */
export class JobQueueInitializer {
  private static initialized = false;

  static initialize(): void {
    if (this.initialized) {
      logger.info('Job queue already initialized');
      return;
    }

    try {
      // Initialize processors
      const instructorRepo = new MongoInstructorRepository();
      new ResumeUploadProcessor(instructorRepo);
      new EmailProcessor();

      logger.info('Job queue processors initialized successfully');
      this.initialized = true;
    } catch (error) {
      logger.info('Failed to initialize job queue processors:', error);
      throw error;
    }
  }

  static async close(): Promise<void> {
    if (this.initialized) {
      await jobQueueService.closeAll();
      this.initialized = false;
      logger.info('Job queue closed');
    }
  }
}
