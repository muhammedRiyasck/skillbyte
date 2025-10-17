import redis from "../../../../shared/utils/Redis";
import bcrypt from 'bcryptjs';
import { IStudentRepository } from '../../../student/domain/IRepositories/IStudentRepository';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';
import { NodeMailerService } from '../../../../shared/services/mail/NodeMailerService';
import { SuccessResetPasswordTemplate } from "../../../../shared/templates/SuccessResetPassword";
import { IResetPasswordUseCase } from "../interfaces/IResetPasswordUseCase";
import { ERROR_MESSAGES } from "../../../../shared/constants/messages";
import { HttpError } from "../../../../shared/types/HttpError";
import { HttpStatusCode } from "../../../../shared/enums/HttpStatusCodes";
import { ResetPasswordSchema } from "../../../../shared/validations/AuthValidation";

/**
 * Use case for resetting a user's password.
 * Handles token validation, password hashing, and notification via email.
 */
export class ResetPasswordUseCase implements IResetPasswordUseCase {
    private readonly nodeMailerService: NodeMailerService;

    /**
     * Constructs the ResetPasswordUseCase.
     * @param studentRepo - Repository for student operations.
     * @param instructorRepo - Repository for instructor operations.
     */
    constructor(
        private readonly studentRepo: IStudentRepository,
        private readonly instructorRepo: IInstructorRepository
    ) {
        this.nodeMailerService = new NodeMailerService();
    }

    /**
     * Executes the password reset process.
     * @param token - The reset token from the request.
     * @param password - The new password to set.
     * @param role - The role of the user ('student' or 'instructor').
     * @throws Error if the token is invalid, expired, or if password reset fails.
     */
    async execute(token: string, password: string, role: string): Promise<void> {
        const userId = await redis.get(`reset:${token}`);
        if (!userId) {
            throw new HttpError(ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN, HttpStatusCode.BAD_REQUEST);
        }

        // Validate the password using Zod schema
        const validationResult = ResetPasswordSchema.safeParse({ token, password, role });
        if (!validationResult.success) {
            throw new HttpError(validationResult.error.issues.map((e) => e.message).join(', '), HttpStatusCode.BAD_REQUEST);
        }

        const hashedPassword = await bcrypt.hash(validationResult.data.password, 10);

        const repository = role === 'student' ? this.studentRepo : this.instructorRepo;
        const updatedUser = await repository.findByIdAndUpdatePassword(userId, hashedPassword);

        if (updatedUser) {
            await redis.del(`reset:${token}`);
            await this.nodeMailerService.sendMail(
                updatedUser.email,
                'Your password was changed',
                SuccessResetPasswordTemplate(updatedUser.name)
            );
        } else {
            throw new HttpError('Something went wrong while resetting the password', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }
    }
}
