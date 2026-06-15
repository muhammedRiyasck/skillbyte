import { IGetQuizResultUseCase } from '../interfaces/IGetQuizResultUseCase';
import { IQuizAttemptRepository } from '../../domain/IRepositories/IQuizAttemptRepository';
import { QuizAttemptResponseDto } from '../dtos/QuizAttemptResponseDto';
import { QuizAttemptMapper } from '../mappers/QuizAttemptMapper';

export class GetQuizResultUseCase implements IGetQuizResultUseCase {
  constructor(private quizAttemptRepository: IQuizAttemptRepository) {}

  async execute(
    courseId: string,
    userId: string,
  ): Promise<QuizAttemptResponseDto | null> {
    const attempt = await this.quizAttemptRepository.findLatestByCourseAndUser(
      courseId,
      userId,
    );
    if (!attempt) {
      return null;
    }

    return QuizAttemptMapper.toDto(attempt);
  }
}
