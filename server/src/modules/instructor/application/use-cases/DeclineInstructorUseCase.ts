import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { declinedInstructorEmailTemplate } from '../../../../shared/templates/DeclinedInstructor';
import { IDeclineInstructorUseCase } from '../interfaces/IDeclineInstructorUseCase';
import { EmailJobData, JOB_NAMES, QUEUE_NAMES } from '../../../../shared/services/job-queue/JobTypes';
import { jobQueueService } from '../../../../shared/services/job-queue/JobQueueService';

/**
 * Use case for declining an instructor application.
 * Handles the decline process, including updating the instructor's status and sending a notification email with the reason.
 */
export class DeclineInstructorUseCase implements IDeclineInstructorUseCase {
  /**
   * Constructs the DeclineInstructorUseCase.
   * @param repo - The instructor repository for data operations.
   * @param mailer - The mailer service for sending emails.
   */
  constructor(
    private _instructorRepo: IInstructorRepository
  ) {}

  /**
   * Executes the instructor decline process.
   * Declines the instructor application, retrieves their details, and sends a decline email with the reason.
   * @param id - The ID of the instructor to decline.
   * @param adminId - The ID of the admin performing the decline.
   * @param reason - The reason for declining the application.
   * @throws Error if the decline or email sending fails.
   */
  async execute(id: string, adminId: string, reason: string): Promise<void> {
    await this._instructorRepo.decline(id, adminId, reason);

    const instructor = await this._instructorRepo.findById(id);
    if (instructor) {

      const emailData: EmailJobData = {
      to: instructor.email,
      subject: '⚠️ SkillByte Instructor Application Declined',
      html: declinedInstructorEmailTemplate(instructor.name, reason)
    };

    await jobQueueService.addJob(QUEUE_NAMES.EMAIL, JOB_NAMES.SEND_EMAIL, emailData);
    }
  }
}
