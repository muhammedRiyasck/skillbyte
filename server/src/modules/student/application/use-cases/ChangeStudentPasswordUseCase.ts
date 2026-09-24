import { IStudentRepository } from '../../domain/IRepositories/IStudentRepository';
import { IPasswordHasher } from '../../../../shared/services/password-hasher/IPasswordHasher';
import { IMailerService } from '../../../../shared/services/mail/IMailerService';
import { IChangeStudentPasswordUseCase } from '../interfaces/IChangeStudentPasswordUseCase';
import { ChangeStudentPasswordDto } from '../../entry-points/validations/ChangeStudentPasswordValidation';
import { SuccessResetPasswordTemplate } from '../../../../shared/templates/SuccessResetPassword';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import logger from '../../../../shared/utils/Logger';

/** Executes the business logic for change student password. */
export class ChangeStudentPasswordUseCase
  implements IChangeStudentPasswordUseCase
{
  constructor(
    private readonly _studentRepo: IStudentRepository,
    private readonly _passwordHasher: IPasswordHasher,
    private readonly _mailerService: IMailerService,
  ) {}

  /**
   * Execute for the ChangeStudentPassword entity.
   *
   * @param studentId - The unique identifier for the student.
   * @param dto - The data transfer object containing request details.
   */
  async execute(
    studentId: string,
    dto: ChangeStudentPasswordDto,
  ): Promise<void> {
    const student = await this._studentRepo.findById(studentId);
    if (!student) {
      throw new HttpError('Student not found', HttpStatusCode.NOT_FOUND);
    }

    // Google OAuth students have no local password
    if (student.registeredVia !== 'local' || !student.passwordHash) {
      throw new HttpError(
        'Password change is not available for accounts registered via Google or Facebook sign-in.',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const isCurrentPasswordValid = await this._passwordHasher.compare(
      dto.currentPassword,
      student.passwordHash,
    );
    if (!isCurrentPasswordValid) {
      throw new HttpError(
        'Current password is incorrect',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const hashedNewPassword = await this._passwordHasher.hash(dto.newPassword);

    const updated = await this._studentRepo.findByIdAndUpdatePassword(
      studentId,
      hashedNewPassword,
    );
    if (!updated) {
      throw new HttpError(
        ERROR_MESSAGES.SOMETHING_WENT_WRONG,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    logger.info(`Student ${studentId} changed their password successfully`);

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
