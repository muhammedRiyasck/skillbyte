import { Job } from 'bull';
import { jobQueueService } from '../JobQueueService';
import { ResumeUploadJobData, JOB_NAMES, QUEUE_NAMES } from '../JobTypes';
import { IInstructorRepository } from '../../../../modules/instructor/domain/IRepositories/IInstructorRepository';
import logger from '../../../utils/Logger';
import { IStorageService } from '../../file-upload/interfaces/IStorageService';

/** Handles resume upload processor functionality. */
export class ResumeUploadProcessor {
  constructor(
    private readonly _instructorRepo: IInstructorRepository,
    private readonly _storageService: IStorageService,
  ) {
    this._registerProcessor();
  }

  private _registerProcessor(): void {
    jobQueueService.processJob<ResumeUploadJobData>(
      QUEUE_NAMES.INSTRUCTOR_REGISTRATION,
      JOB_NAMES.RESUME_UPLOAD,
      (job) => this._processResumeUpload(job),
    );
  }

  private async _processResumeUpload(
    job: Job<ResumeUploadJobData>,
  ): Promise<void> {
    const { instructorId, fileBuffer, originalName, mimetype } = job.data;

    try {
      // Storage concerns remain behind IStorageService so this processor can
      // work with any buffer-capable provider, not only S3/Backblaze.
      const buffer = Buffer.from(fileBuffer, 'base64');
      const resumeUrl = await this._storageService.uploadBuffer(
        buffer,
        originalName,
        {
          folder: 'instructor-resumes',
          contentType: mimetype || 'application/pdf',
        },
      );

      logger.info(
        `Resume uploaded successfully for instructor ${instructorId}: ${resumeUrl}`,
      );

      const instructor = await this._instructorRepo.findById(instructorId);
      if (instructor) {
        await this._instructorRepo.updateById(instructorId, { resumeUrl });
        logger.info(`Instructor ${instructorId} resume URL updated`);
      } else {
        logger.error(`Instructor ${instructorId} not found for resume update`);
      }
    } catch (error) {
      logger.error(
        `Resume upload failed for instructor ${instructorId}:`,
        error,
      );
      throw error;
    }
  }
}
