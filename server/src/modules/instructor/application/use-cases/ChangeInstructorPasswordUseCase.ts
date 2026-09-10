import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { IPasswordHasher } from '../../../../shared/services/password-hasher/IPasswordHasher';
import { IMailerService } from '../../../../shared/services/mail/IMailerService';
import { IChangeInstructorPasswordUseCase } from '../interfaces/IChangeInstructorPasswordUseCase';
import { ChangeInstructorPasswordDto } from '../../entry-point/validations/ChangeInstructorPasswordValidation';
import { SuccessResetPasswordTemplate } from '../../../../shared/templates/SuccessResetPassword';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import logger from '../../../../shared/utils/Logger';

/**
 * Use case for in-app password change for authenticated instructors.
 * Validates the current password, hashes the new one, persists, and sends a confirmation email.
 */
export class ChangeInstructorPasswordUseCase
  implements IChangeInstructorPasswordUseCase
{
  constructor(
    private readonly _instructorRepo: IInstructorRepository,
    private readonly _passwordHasher: IPasswordHasher,
    private readonly _mailerService: IMailerService,
  ) {}

  async execute(
    instructorId: string,
    dto: ChangeInstructorPasswordDto,
  ): Promise<void> {
    const instructor = await this._instructorRepo.findById(instructorId);
    if (!instructor) {
      throw new HttpError('Instructor not found', HttpStatusCode.NOT_FOUND);
    }

    // Google OAuth instructors have no local password
    // if (instructor === 'google' || !instructor.passwordHash) {
    //   throw new HttpError(
    //     'Password change is not available for accounts registered via Google sign-in.',
    //     HttpStatusCode.BAD_REQUEST,
    //   );
    // }

    const isCurrentPasswordValid = await this._passwordHasher.compare(
      dto.currentPassword,
      instructor.passwordHash,
    );
    if (!isCurrentPasswordValid) {
      throw new HttpError(
        'Current password is incorrect',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const hashedNewPassword = await this._passwordHasher.hash(dto.newPassword);

    const updated = await this._instructorRepo.findByIdAndUpdatePassword(
      instructorId,
      hashedNewPassword,
    );
    if (!updated) {
      throw new HttpError(
        ERROR_MESSAGES.SOMETHING_WENT_WRONG,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    logger.info(
      `Instructor ${instructorId} changed their password successfully`,
    );

    try {
      await this._mailerService.sendMail(
        updated.email,
        'Your SkillByte password was changed',
        SuccessResetPasswordTemplate(updated.name),
      );
    } catch (emailError) {
      // Email failure is non-fatal — password was already updated
      logger.error(
        `Failed to send password-change confirmation email to ${updated.email}`,
        emailError,
      );
    }
  }
}
