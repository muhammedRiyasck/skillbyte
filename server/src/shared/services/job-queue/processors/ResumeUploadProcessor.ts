import { Job } from 'bull';
import { jobQueueService } from '../JobQueueService';
import { ResumeUploadJobData, JOB_NAMES, QUEUE_NAMES } from '../JobTypes';
import { uploadToBackblaze } from '../../../utils/Backblaze';
import { IInstructorRepository } from '../../../../modules/instructor/domain/IRepositories/IInstructorRepository';
import fs from 'fs';
import logger from '../../../utils/Logger';

export class ResumeUploadProcessor {
  constructor(private readonly _instructorRepo: IInstructorRepository) {
    this._registerProcessor();
  }

  private _registerProcessor(): void {
    jobQueueService.processJob(
      QUEUE_NAMES.INSTRUCTOR_REGISTRATION,
      JOB_NAMES.RESUME_UPLOAD,
      this._processResumeUpload.bind(this) as any
    );
  }

  private async _processResumeUpload(job: Job<ResumeUploadJobData>): Promise<void> {
    const { instructorId, filePath, originalName, email } = job.data;

    try {
      console.log(`Processing resume upload for instructor ${instructorId}, email: ${email}`);

      // Extract file extension from original filename
      const fileExtension = originalName.split('.').pop();
      // const publicId = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

      const resumeUrl = await uploadToBackblaze(filePath, {
        folder: 'instructor-resumes',
        contentType: fileExtension === 'pdf' ? 'application/pdf' : 'application/msword',
        publicRead: true,
      });

      logger.info(`Resume uploaded successfully for instructor ${instructorId}: ${resumeUrl}`);

      // Update instructor record with resume URL
      const instructor = await this._instructorRepo.findById(instructorId);
      if (instructor) {
        instructor.resumeUrl = resumeUrl;
        await this._instructorRepo.updateById(instructorId,instructor);
        logger.info(`Instructor ${instructorId} resume URL updated`);
      } else {
        logger.error(`Instructor ${instructorId} not found for resume update`);
      }

      // Clean up the temporary file
      try {
        fs.unlinkSync(filePath);
        console.log(`Temporary file ${filePath} cleaned up`);
      } catch (cleanupError) {
        console.error('Failed to cleanup temp file:', cleanupError);
      }

    } catch (error) {
      logger.error(`Resume upload failed for instructor ${instructorId}:`, error);

      // Clean up the temporary file even on error
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.error('Failed to cleanup temp file on error:', cleanupError);
      }

      throw error; // Re-throw to mark job as failed
    }
  }
}
