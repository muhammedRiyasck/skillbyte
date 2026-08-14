import { IGetQuizResultUseCase } from '../interfaces/IGetQuizResultUseCase';
import { IQuizAttemptRepository } from '../../domain/IRepositories/IQuizAttemptRepository';
import { QuizAttemptResponseDto } from '../dtos/QuizAttemptResponseDto';
import { QuizAttemptMapper } from '../mappers/QuizAttemptMapper';
import { QuizStatus } from '../../../../shared/enums/QuizStatus';

export class GetQuizResultUseCase implements IGetQuizResultUseCase {
  constructor(private quizAttemptRepository: IQuizAttemptRepository) {}

  async execute(
    courseId: string,
    userId: string,
  ): Promise<QuizAttemptResponseDto | null> {
    // Fetch all attempts sorted by attemptNumber ascending so we can pick the best
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
      // Return the highest-scoring passed attempt
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
      // Return the last completed attempt
      return QuizAttemptMapper.toDto(
        completedAttempts[completedAttempts.length - 1],
      );
    }

    // Fallback: return the last attempt in any state
    return QuizAttemptMapper.toDto(attempts[attempts.length - 1]);
  }
}
