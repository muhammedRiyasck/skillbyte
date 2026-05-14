import { IGetQuizResultUseCase } from '../interfaces/IGetQuizResultUseCase';
import { IQuizAttemptRepository } from '../../domain/IRepositories/IQuizAttemptRepository';
import { IQuizAttempt } from '../../domain/entities/QuizAttempt';

export class GetQuizResultUseCase implements IGetQuizResultUseCase {
  constructor(private quizAttemptRepository: IQuizAttemptRepository) {}

  async execute(
    courseId: string,
    userId: string,
  ): Promise<IQuizAttempt | null> {
    const attempt = await this.quizAttemptRepository.findLatestByCourseAndUser(
      courseId,
      userId,
    );
    if (!attempt) {
      return null;
    }

    // Check if the instructor has hidden the quiz? Could add checks if needed.

    return attempt;
  }
}
