import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { IReapplyInstructorUseCase } from '../interfaces/IReapplyInstructorUseCase';
import { Instructor } from '../../domain/entities/Instructor';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { jobQueueService } from '../../../../shared/services/job-queue/JobQueueService';
import { JOB_NAMES, QUEUE_NAMES, ResumeUploadJobData } from '../../../../shared/services/job-queue/JobTypes';
import bcrypt from 'bcryptjs';

export class ReapplyInstructorUseCase implements IReapplyInstructorUseCase {
  constructor(private readonly _instructorRepo: IInstructorRepository) {}

  async execute(
    email: string,
    updates: Partial<Instructor>,
    resumeFile?: Express.Multer.File
  ): Promise<void> {
    const instructor = await this._instructorRepo.findByEmail(email);
    if (!instructor) {
      throw new HttpError(ERROR_MESSAGES.INSTRUCTOR_NOT_FOUND, HttpStatusCode.NOT_FOUND);
    }
   

    if (instructor.accountStatus !== 'rejected') {
      console.log('Instructor account status:', instructor.accountStatus);
      throw new HttpError("Only rejected applications can be re-submitted", HttpStatusCode.BAD_REQUEST);
    }

    const updatedData: Partial<Instructor> = {
      ...updates,
      accountStatus: 'pending',
      // rejected: false,
      rejectedNote: null,
      suspendNote: null
    };

    // Handle password hashing if provided and not empty
    if ((updates as any).password && (updates as any).password.trim().length > 0) {
      updatedData.passwordHash = await bcrypt.hash((updates as any).password, 10);
    }
    // Remove plain password field from payload to prevent DB issues
    delete (updatedData as any).password;

    await this._instructorRepo.updateById(instructor.instructorId!, updatedData);

    if (resumeFile) {
        const resumeUploadData: ResumeUploadJobData = {
          instructorId: instructor.instructorId!,
          filePath: resumeFile.path,
          originalName: resumeFile.originalname,
          email: instructor.email,
        };
  
        await jobQueueService.addJob(
          QUEUE_NAMES.INSTRUCTOR_REGISTRATION,
          JOB_NAMES.RESUME_UPLOAD,
          resumeUploadData
        );
      }
  }
}
