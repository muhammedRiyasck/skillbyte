import { IGetQuizResultUseCase } from '../interfaces/IGetQuizResultUseCase';
import { IQuizAttemptRepository } from '../../domain/IRepositories/IQuizAttemptRepository';
import { QuizAttemptResponseDto } from '../dtos/QuizAttemptResponseDto';
import { QuizAttemptMapper } from '../mappers/QuizAttemptMapper';
import { QuizStatus } from '../../../../shared/enums/QuizStatus';

/** Executes the business logic for get quiz result. */
export class GetQuizResultUseCase implements IGetQuizResultUseCase {
  constructor(private quizAttemptRepository: IQuizAttemptRepository) {}

  /**
   * Execute for the GetQuizResult entity.
   *
   * @param courseId - The unique identifier for the course.
   * @param userId - The unique identifier for the user.
   * @returns The standardized HTTP response.
   */
  async execute(
    courseId: string,
    userId: string,
  ): Promise<QuizAttemptResponseDto | null> {
    const attempts = await this.quizAttemptRepository.findAllByCourseAndUser(
      courseId,
      userId,
    );

    if (!attempts || attempts.length === 0) {
      return null;
    }

    // Priority: 1) passed attempt (best score), 2) latest completed, 3) latest overall
    const passedAttempts = attempts.filter((a) => a.passed);
    if (passedAttempts.length > 0) {
      const best = passedAttempts.reduce((prev, curr) =>
        curr.score > prev.score ? curr : prev,
      );
      return QuizAttemptMapper.toDto(best);
    }

    const completedAttempts = attempts.filter(
      (a) =>
        a.status === QuizStatus.COMPLETED || a.status === QuizStatus.TIMED_OUT,
    );
    if (completedAttempts.length > 0) {
      return QuizAttemptMapper.toDto(
        completedAttempts[completedAttempts.length - 1],
      );
    }

    // Fallback: return the last attempt in any state
    return QuizAttemptMapper.toDto(attempts[attempts.length - 1]);
  }
}
