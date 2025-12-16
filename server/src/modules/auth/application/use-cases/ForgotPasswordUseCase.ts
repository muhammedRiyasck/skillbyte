import { IStudentRepository } from '../../../student/domain/IRepositories/IStudentRepository';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';
import { createPasswordResetToken } from '../../../../shared/utils/TokenGenrator';
import { NodeMailerService } from '../../../../shared/services/mail/NodeMailerService';
import { ResetPasswordTemplate } from '../../../../shared/templates/ResetPassword';
import redis from '../../../../shared/utils/Redis';
import logger from '../../../../shared/utils/Logger';
import { IForgotPasswordUseCase } from '../interfaces/IForgotPasswordUseCase';
import { Student } from '../../../student/domain/entities/Student';
import { Instructor } from '../../../instructor/domain/entities/Instructor';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

/**
 * Use case for handling forgot password functionality.
 * This class generates a password reset token and sends a reset email to the user.
 */
export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
  private _nodeMailer: NodeMailerService;

  /**
   * Creates an instance of ForgotPasswordUseCase.
   * @param studentRepo - The repository for student data.
   * @param instructorRepo - The repository for instructor data.
   */
  constructor(
    private _studentRepo: IStudentRepository,
    private _instructorRepo: IInstructorRepository,
  ) {
    this._nodeMailer = new NodeMailerService();
  }

  /**
   * Executes the forgot password process.
   * @param email - The email address of the user requesting password reset.
   * @param role - The role of the user ('student' or 'instructor').
   * @returns A promise that resolves to false if the user is not found, or void if the process succeeds.
   * @throws {HttpError} If the email or role is invalid, user ID is not found, or email sending fails.
   */
  async execute(email: string, role: string): Promise<false | void> {
    if (!email || !role) {
      throw new HttpError(
        'Email and role are required',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    if (role !== 'student' && role !== 'instructor') {
      throw new HttpError('Invalid role provided', HttpStatusCode.BAD_REQUEST);
    }

    const repo = role === 'student' ? this._studentRepo : this._instructorRepo;
    const user = await repo.findByEmail(email);
    if (!user) {
      return false;
    }

    const id =
      role === 'student'
        ? (user as Student).studentId
        : (user as Instructor).instructorId;
    if (!id) {
      throw new HttpError(
        'User ID not found',
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    const token = await createPasswordResetToken(id);
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}&role=${role}`;

    try {
      await this._nodeMailer.sendMail(
        user.email,
        'Reset your password',
        ResetPasswordTemplate(user.name, resetUrl),
      );
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      await redis.del(`reset:${token}`);
      throw error;
    }
  }
}
