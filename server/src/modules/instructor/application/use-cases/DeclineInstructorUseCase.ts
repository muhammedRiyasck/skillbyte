import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { declinedInstructorEmailTemplate } from '../../../../shared/templates/DeclinedInstructor';
import { IDeclineInstructorUseCase } from '../interfaces/IDeclineInstructorUseCase';
import {
  EmailJobData,
  JOB_NAMES,
  QUEUE_NAMES,
} from '../../../../shared/services/job-queue/JobTypes';
import { jobQueueService } from '../../../../shared/services/job-queue/JobQueueService';

/** Executes the business logic for decline instructor. */
export class DeclineInstructorUseCase implements IDeclineInstructorUseCase {
  /**
   * Constructs the DeclineInstructorUseCase.
   * @param repo - The instructor repository for data operations.
   * @param mailer - The mailer service for sending emails.
   */
  constructor(private _instructorRepo: IInstructorRepository) {}

  /**
   * Execute for the DeclineInstructor entity.
   *
   * @param id - The unique identifier for the id.
   * @param adminId - The unique identifier for the admin.
   * @param reason - The reason information.
   */
  async execute(id: string, adminId: string, reason: string): Promise<void> {
    await this._instructorRepo.decline(id, adminId, reason);

    const instructor = await this._instructorRepo.findById(id);
    if (instructor) {
      const emailData: EmailJobData = {
        to: instructor.email,
        subject: '⚠️ SkillByte Instructor Application Declined',
        html: declinedInstructorEmailTemplate(instructor.name, reason),
      };

      await jobQueueService.addJob(
        QUEUE_NAMES.EMAIL,
        JOB_NAMES.SEND_EMAIL,
        emailData,
      );
    }

    await jobQueueService.addJob(
      QUEUE_NAMES.CLEANUP,
      JOB_NAMES.DELETE_DECLINED_INSTRUCTOR,
      { instructorId: id },
      { delay: 2 * 24 * 60 * 60 * 1000 }, // 2 days
    );
  }
}
