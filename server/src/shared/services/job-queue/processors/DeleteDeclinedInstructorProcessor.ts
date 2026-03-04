import { Job } from 'bull';
import { jobQueueService } from '../JobQueueService';
import { JOB_NAMES, QUEUE_NAMES } from '../JobTypes';
import { IInstructorRepository } from '../../../../modules/instructor/domain/IRepositories/IInstructorRepository';
import logger from '../../../utils/Logger';
import { IStorageService } from '../../file-upload/interfaces/IStorageService';

export class DeleteDeclinedInstructorProcessor {
  constructor(
    private _instructorRepo: IInstructorRepository,
    private _storageService: IStorageService,
  ) {
    this._registerProcessor();
  }

  private _registerProcessor(): void {
    jobQueueService.processJob(
      QUEUE_NAMES.CLEANUP,
      JOB_NAMES.DELETE_DECLINED_INSTRUCTOR,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this._processDelete.bind(this) as any,
    );
  }

  private async _processDelete(
    job: Job<{ instructorId: string }>,
  ): Promise<void> {
    const { instructorId } = job.data;

    try {
      logger.info(`Processing delete for declined instructor: ${instructorId}`);

      const instructor = await this._instructorRepo.findById(instructorId);

      if (!instructor) {
        logger.info(`Instructor ${instructorId} already deleted`);
        return;
      }

      if (
        instructor.rejected == true &&
        instructor.accountStatus === 'rejected'
      ) {
        logger.info(
          `Instructor ${instructorId} is not declined. Skipping delete.`,
        );
        return;
      }

      // Clean up media from cloud storage
      if (instructor.resumeUrl) {
        try {
          const resumeId = this._storageService.getIdentifierFromUrl(
            instructor.resumeUrl,
          );
          await this._storageService.delete(resumeId);
        } catch (error) {
          logger.error(
            `Failed to delete cloud resume for instructor ${instructorId}:`,
            error,
          );
        }
      }

      await this._instructorRepo.deleteById(instructorId);

      logger.info(
        `Instructor ${instructorId} deleted successfully after 2 days`,
      );
    } catch (error) {
      logger.error(`Failed to delete instructor ${instructorId}:`, error);
      throw error; // Mark job as failed
    }
  }
}
