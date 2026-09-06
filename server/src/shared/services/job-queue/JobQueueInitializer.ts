import { jobQueueService } from './JobQueueService';
import logger from '../../utils/Logger';
import { registerInstructorJobs } from '../../../modules/instructor/entry-point/dependencyInjection/InstructorJobRegistrar';
import { registerMentorshipJobs } from '../../../modules/mentorship/entry-point/dependencyInjection/MentorshipJobRegistrar';
import { registerAdminJobs } from '../../../modules/admin/entry-points/dependencyInjection/AdminJobRegistrar';
import { registerCourseJobs } from '../../../modules/course/entry-point/dependencyInjection/CourseJobRegistrar';
import { registerSharedJobs } from './SharedJobRegistrar';

/**
 * Thin bootstrap orchestrator for all background job queues.
 *
 * Each domain module is responsible for registering its own processors,
 * recurring jobs, and event-bus subscriptions via its own `*JobRegistrar`
 * function. This class simply calls each registrar in order and is therefore
 * Open for extension (add a new registrar import + call) and Closed for
 * modification (no domain-specific logic lives here).
 */
export class JobQueueInitializer {
  private static _initialized = false;

  static initialize(): void {
    if (this._initialized) {
      logger.info('Job queue already initialized');
      return;
    }

    try {
      registerSharedJobs();
      registerInstructorJobs();
      registerMentorshipJobs();
      registerAdminJobs();
      registerCourseJobs();

      logger.info('Job queue processors initialized successfully');
      this._initialized = true;
    } catch (error) {
      logger.error('Failed to initialize job queue processors:', error);
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
