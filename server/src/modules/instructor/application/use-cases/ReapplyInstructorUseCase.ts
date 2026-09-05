import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { IReapplyInstructorUseCase } from '../interfaces/IReapplyInstructorUseCase';
import { Instructor } from '../../domain/entities/Instructor';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { InstructorAccountStatus } from '../../../../shared/enums/InstructorAccountStatus';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { eventBus } from '../../../../shared/services/event-bus/EventBus';
import { INSTRUCTOR_EVENTS } from '../../../../shared/services/event-bus/InstructorEvents';
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';
import { IPasswordHasher } from '../../../../shared/services/password-hasher/IPasswordHasher';
import { passwordHasher } from '../../../../shared/services/password-hasher/BcryptPasswordHasher';

export class ReapplyInstructorUseCase implements IReapplyInstructorUseCase {
  constructor(
    private readonly _instructorRepo: IInstructorRepository,
    private readonly _storageService: IStorageService,
    private readonly _passwordHasher: IPasswordHasher = passwordHasher,
  ) {}

  async execute(
    email: string,
    updates: Partial<Instructor>,
    resumeFile?: Express.Multer.File,
  ): Promise<void> {
    const instructor = await this._instructorRepo.findByEmail(email);
    if (!instructor) {
      throw new HttpError(
        ERROR_MESSAGES.INSTRUCTOR_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    if (instructor.accountStatus !== InstructorAccountStatus.REJECTED) {
      throw new HttpError(
        'Only rejected applications can be re-submitted',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const updatedData: Partial<Instructor> = {
      ...updates,
      accountStatus: InstructorAccountStatus.PENDING,
      // rejected: false,
      rejectedNote: null,
      suspendNote: null,
    };

    // Handle password hashing if provided and not empty
    // Handle password hashing if provided and not empty
    const updatesWithPassword = updates as Partial<Instructor> & {
      password?: string;
    };
    if (
      updatesWithPassword.password &&
      updatesWithPassword.password.trim().length > 0
    ) {
      updatedData.passwordHash = await this._passwordHasher.hash(
        updatesWithPassword.password,
      );
    }
    // Remove plain password field from payload to prevent DB issues
    delete updatesWithPassword.password;

    await this._instructorRepo.updateById(
      instructor.instructorId!,
      updatedData,
    );

    if (resumeFile) {
      // Fire-and-forget: clean up old resume in background, don't block response
      if (instructor.resumeUrl) {
        try {
          const oldResumeId = this._storageService.getIdentifierFromUrl(
            instructor.resumeUrl,
          );
          void this._storageService.delete(oldResumeId); // non-blocking
        } catch (error) {
          console.error(
            `Failed to parse old resume URL for instructor ${instructor.instructorId}:`,
            error,
          );
        }
      }

      eventBus.emit(INSTRUCTOR_EVENTS.RESUME_UPLOAD_REQUESTED, {
        instructorId: instructor.instructorId!,
        filePath: resumeFile.path,
        originalName: resumeFile.originalname,
        email: instructor.email,
      });
    }
  }
}
