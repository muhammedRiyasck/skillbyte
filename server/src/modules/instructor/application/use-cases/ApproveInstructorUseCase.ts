import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { approvedInstructorEmailTemplate } from '../../../../shared/templates/ApprovedInstructor';
import { IApproveInstructorUseCase } from '../interfaces/IApproveInstructorUseCase';
import {
  EmailJobData,
  JOB_NAMES,
  QUEUE_NAMES,
} from '../../../../shared/services/job-queue/JobTypes';
import { jobQueueService } from '../../../../shared/services/job-queue/JobQueueService';

/** Executes the business logic for approve instructor. */
export class ApproveInstructorUseCase implements IApproveInstructorUseCase {
  /**
   * Constructs the ApproveInstructorUseCase.
   * @param repo - The instructor repository for data operations.
   * @param mailer - The mailer service for sending emails.
   */
  constructor(private _instructorRepo: IInstructorRepository) {}

  /**
   * Execute for the ApproveInstructor entity.
   *
   * @param id - The unique identifier for the id.
   * @param adminId - The unique identifier for the admin.
   */
  async execute(id: string, adminId: string): Promise<void> {
    await this._instructorRepo.approve(id, adminId);

    const instructor = await this._instructorRepo.findById(id);
    if (instructor) {
      const emailData: EmailJobData = {
        to: instructor.email,
        subject: '🎉 SkillByte Instructor Approved',
        html: approvedInstructorEmailTemplate(instructor.name),
      };

      await jobQueueService.addJob(
        QUEUE_NAMES.EMAIL,
        JOB_NAMES.SEND_EMAIL,
        emailData,
      );
    }
  }
}
