import { Job } from 'bull';
import { jobQueueService } from '../JobQueueService';
import { JOB_NAMES, QUEUE_NAMES } from '../JobTypes';
import { IInstructorRepository } from '../../../../modules/instructor/domain/IRepositories/IInstructorRepository';
import logger from '../../../utils/Logger';

export class DeleteDeclinedInstructorProcessor {
  

  constructor(private _instructorRepo: IInstructorRepository) {
    this._registerProcessor();
  }

  private _registerProcessor(): void {
    jobQueueService.processJob(
      QUEUE_NAMES.CLEANUP,
      JOB_NAMES.DELETE_DECLINED_INSTRUCTOR,
      this._processDelete.bind(this) as any
    );
  }

  private async _processDelete(job: Job<{instructorId:string}>): Promise<void> {
    const { instructorId } = job.data;

    try {
      logger.info(`Processing delete for declined instructor: ${instructorId}`);

      const instructor = await this._instructorRepo.findById(instructorId);

      if (!instructor) {
        logger.info(`Instructor ${instructorId} already deleted`);
        return;
      }

      if (instructor.rejected == true && instructor.accountStatus === 'rejected' ) {
        logger.info(`Instructor ${instructorId} is not declined. Skipping delete.`);
        return;
      }

      await this._instructorRepo.deleteById(instructorId);

      logger.info(`Instructor ${instructorId} deleted successfully after 2 days`);
    } catch (error) {
      logger.error(`Failed to delete instructor ${instructorId}:`, error);
      throw error; // Mark job as failed
    }
  }
}
