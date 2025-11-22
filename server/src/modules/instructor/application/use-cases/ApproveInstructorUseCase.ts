
import { IMailerService } from '../../../../shared/services/mail/IMailerService';
import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { approvedInstructorEmailTemplate } from '../../../../shared/templates/ApprovedInstructor';
import { IApproveInstructorUseCase } from '../interfaces/IApproveInstructorUseCase';
import { EmailJobData, JOB_NAMES, QUEUE_NAMES } from '../../../../shared/services/job-queue/JobTypes';
import { jobQueueService } from '../../../../shared/services/job-queue/JobQueueService';

/**
 * Use case for approving an instructor.
 * Handles the approval process, including updating the instructor's status and sending a notification email.
 */
export class ApproveInstructorUseCase implements IApproveInstructorUseCase {
  /**
   * Constructs the ApproveInstructorUseCase.
   * @param repo - The instructor repository for data operations.
   * @param mailer - The mailer service for sending emails.
   */
  constructor(
    private repo: IInstructorRepository,
    private mailer: IMailerService,
  ) {}

  /**
   * Executes the instructor approval process.
   * Approves the instructor, retrieves their details, and sends an approval email.
   * @param id - The ID of the instructor to approve.
   * @param adminId - The ID of the admin performing the approval.
   * @throws Error if the approval or email sending fails.
   */
  async execute(id: string, adminId: string): Promise<void> {
    await this.repo.approve(id, adminId);

    const instructor = await this.repo.findById(id);
    if (instructor) {

      const emailData: EmailJobData = {
      to: instructor.email,
      subject: '🎉 SkillByte Instructor Approved',
      html: approvedInstructorEmailTemplate(instructor.name)
    };

    await jobQueueService.addJob(QUEUE_NAMES.EMAIL, JOB_NAMES.SEND_EMAIL, emailData);
    }
  }
}
