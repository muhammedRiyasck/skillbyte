import { IResetStudentQuizAttemptsUseCase } from '../interfaces/IResetStudentQuizAttemptsUseCase';
import { IQuizAttemptRepository } from '../../domain/IRepositories/IQuizAttemptRepository';
import { IQuizConfigRepository } from '../../domain/IRepositories/IQuizConfigRepository';
import { IEnrollmentReadRepository } from '../../../enrollment/domain/IRepositories/IEnrollmentReadRepository';
import { IEnrollmentWriteRepository } from '../../../enrollment/domain/IRepositories/IEnrollmentWriteRepository';
import { EnrollmentStatus } from '../../../../shared/enums/EnrollmentStatus';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

export class ResetStudentQuizAttemptsUseCase
  implements IResetStudentQuizAttemptsUseCase
{
  constructor(
    private quizAttemptRepository: IQuizAttemptRepository,
    private quizConfigRepository: IQuizConfigRepository,
    private enrollmentReadRepo: IEnrollmentReadRepository,
    private enrollmentWriteRepo: IEnrollmentWriteRepository,
  ) {}

  async execute(
    courseId: string,
    studentId: string,
    instructorId: string,
  ): Promise<void> {
    const config = await this.quizConfigRepository.findByCourseId(courseId);

    if (!config) {
      throw new HttpError(
        'Quiz configuration not found',
        HttpStatusCode.NOT_FOUND,
      );
    }

    if (config.instructorId.toString() !== instructorId.toString()) {
      throw new HttpError(
        'Unauthorized to reset attempts for this quiz',
        HttpStatusCode.FORBIDDEN,
      );
    }

    // Delete all quiz attempts for this student
    await this.quizAttemptRepository.deleteAttemptsByCourseAndUser(
      courseId,
      studentId,
    );

    // Revert the enrollment back to ENROLLED (progress 99%) so the student
    // can actually retake the quiz. Without this, they remain COMPLETED even
    // though all their attempts have been wiped.
    const enrollment = await this.enrollmentReadRepo.findEnrollment(
      studentId,
      courseId,
    );
    if (enrollment?.enrollmentId) {
      await this.enrollmentWriteRepo.updateProgress(
        enrollment.enrollmentId,
        99,
        EnrollmentStatus.ACTIVE,
        undefined,
      );
    }
  }
}
