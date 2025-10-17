import { IMailerService } from '../../../../shared/services/mail/IMailerService';
import { accountReactivatedEmailTemplate } from '../../../../shared/templates/AccountReactivated';
import { accountSuspendedEmailTemplate } from '../../../../shared/templates/AccountSuspended';
import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { IChangeInstructorStatusUseCase } from '../interfaces/IChangeInstructorStatusUseCase';
import { HttpError } from '../../../../shared/types/HttpError';

/**
 * Use case for changing an instructor's status (activate or suspend).
 * Updates the instructor's status and sends a notification email accordingly.
 */
export class ChangeInstructorStatusUseCase implements IChangeInstructorStatusUseCase {
  /**
   * Constructs the ChangeInstructorStatusUseCase.
   * @param repo - The instructor repository for data operations.
   * @param mailer - The mailer service for sending emails.
   */
  constructor(
    private repo: IInstructorRepository,
    private mailer: IMailerService,
  ) {}

  /**
   * Executes the status change for an instructor.
   * Updates the instructor's status, retrieves their details, and sends an appropriate email notification.
   * @param id - The ID of the instructor whose status is to be changed.
   * @param status - The new status: 'active' to activate or 'suspend' to suspend.
   * @param note - Optional note for the status change.
   * @throws Error if the status change or email sending fails.
   */
  async execute(id: string, status: 'active' | 'suspend', note?: string): Promise<void> {
    const mappedStatus = status === 'suspend' ? 'suspended' : 'active';
    await this.repo.changeInstructorStatus(id, mappedStatus, note);

    const instructor = await this.repo.findById(id);
    if (!instructor) {
      throw new HttpError('Instructor not found', 404);
    }

    const template =
      status === 'suspend'
        ? accountSuspendedEmailTemplate(instructor.name)
        : accountReactivatedEmailTemplate(instructor.name);

    const subject =
      status === 'suspend'
        ? '⚠️ SkillByte Account Suspended'
        : '✅ SkillByte Account Reactivated';

    await this.mailer.sendMail(instructor.email, subject, template);
  }
}
