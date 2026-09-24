import redis from '../../../../shared/utils/Redis';
import crypto from 'crypto';
import { IStudentRepository } from '../../../student/domain/IRepositories/IStudentRepository';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';
import { SuccessResetPasswordTemplate } from '../../../../shared/templates/SuccessResetPassword';
import { IResetPasswordUseCase } from '../interfaces/IResetPasswordUseCase';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

import { IMailerService } from '../../../../shared/services/mail/IMailerService';
import { UserRole } from '../../../../shared/enums/UserRole';
import { IPasswordHasher } from '../../../../shared/services/password-hasher/IPasswordHasher';
import { passwordHasher } from '../../../../shared/services/password-hasher/BcryptPasswordHasher';

import { ResetPasswordRequestDto } from '../dtos/ResetPasswordRequestDto';

/** Executes the business logic for reset password. */
export class ResetPasswordUseCase implements IResetPasswordUseCase {
  /**
   * Constructs the ResetPasswordUseCase.
   * @param studentRepo - Repository for student operations.
   * @param instructorRepo - Repository for instructor operations.
   * @param _nodeMailerService - Mailer service.
   * @param _passwordHasher - Abstraction for password hashing.
   */
  constructor(
    private readonly _studentRepo: IStudentRepository,
    private readonly _instructorRepo: IInstructorRepository,
    private readonly _nodeMailerService: IMailerService,
    private readonly _passwordHasher: IPasswordHasher = passwordHasher,
  ) {}

  /**
   * Execute for the ResetPassword entity.
   *
   * @param dto - The data transfer object containing request details.
   */
  async execute(dto: ResetPasswordRequestDto): Promise<void> {
    const { token, password, role } = dto;
    if (!password) {
      throw new HttpError(
        ERROR_MESSAGES.INVALID_INPUT,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const userId = await redis.get(`reset:${tokenHash}`);
    if (!userId) {
      throw new HttpError(
        ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const hashedPassword = await this._passwordHasher.hash(password);

    const repository =
      role === UserRole.STUDENT ? this._studentRepo : this._instructorRepo;
    const updatedUser = await repository.findByIdAndUpdatePassword(
      userId,
      hashedPassword,
    );

    if (updatedUser) {
      await redis.del(`reset:${tokenHash}`);
      await this._nodeMailerService.sendMail(
        updatedUser.email,
        'Your password was changed',
        SuccessResetPasswordTemplate(updatedUser.name),
      );
    } else {
      throw new HttpError(
        ERROR_MESSAGES.SOMETHING_WENT_WRONG,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
