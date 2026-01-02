import { Job } from 'bull';
import { jobQueueService } from '../JobQueueService';
import { ResumeUploadJobData, JOB_NAMES, QUEUE_NAMES } from '../JobTypes';
import { IInstructorRepository } from '../../../../modules/instructor/domain/IRepositories/IInstructorRepository';
import fs from 'fs/promises';
import logger from '../../../utils/Logger';
import { IStorageService } from '../../file-upload/interfaces/IStorageService';

export class ResumeUploadProcessor {
  constructor(
    private readonly _instructorRepo: IInstructorRepository,
    private readonly _storageService: IStorageService,
  ) {
    this._registerProcessor();
  }

  private _registerProcessor(): void {
    jobQueueService.processJob(
      QUEUE_NAMES.INSTRUCTOR_REGISTRATION,
      JOB_NAMES.RESUME_UPLOAD,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this._processResumeUpload.bind(this) as any,
    );
  }

  private async _processResumeUpload(
    job: Job<ResumeUploadJobData>,
  ): Promise<void> {
    const { instructorId, filePath, originalName } = job.data;

    try {
      const fileExtension = originalName.split('.').pop();

      const resumeUrl = await this._storageService.upload(filePath, {
        folder: 'instructor-resumes',
        contentType:
          fileExtension === 'pdf' ? 'application/pdf' : 'application/msword',
      });

      logger.info(
        `Resume uploaded successfully for instructor ${instructorId}: ${resumeUrl}`,
      );

      const instructor = await this._instructorRepo.findById(instructorId);
      if (instructor) {
        instructor.resumeUrl = resumeUrl;
        await this._instructorRepo.updateById(instructorId, instructor);
        logger.info(`Instructor ${instructorId} resume URL updated`);
      } else {
        logger.error(`Instructor ${instructorId} not found for resume update`);
      }

      // Clean up the temporary file
      try {
        await fs.unlink(filePath);
        logger.info(`Temporary file ${filePath} cleaned up`);
      } catch (cleanupError) {
        logger.error('Failed to cleanup temp file:', cleanupError);
      }
    } catch (error) {
      logger.error(
        `Resume upload failed for instructor ${instructorId}:`,
        error,
      );

      // Clean up the temporary file even on error
      try {
        await fs.unlink(filePath);
      } catch (cleanupError) {
        logger.error('Failed to cleanup temp file on error:', cleanupError);
      }

      throw error;
    }
  }
}
