import { IMailerService } from '../../../../shared/services/mail/IMailerService';
import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { declinedInstructorEmailTemplate } from '../../../../shared/templates/DeclinedInstructor';
import { IDeclineInstructorUseCase } from '../interfaces/IDeclineInstructorUseCase';

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
    private repo: IInstructorRepository,
    private mailer: IMailerService,
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
    await this.repo.decline(id, adminId, reason);

    const instructor = await this.repo.findById(id);
    if (instructor) {
      await this.mailer.sendMail(
        instructor.email,
        '⚠️ SkillByte Instructor Application Declined',
        declinedInstructorEmailTemplate(instructor.name, reason),
      );
    }
  }
}
