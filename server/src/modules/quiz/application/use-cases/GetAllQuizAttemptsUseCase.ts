import { IGetAllQuizAttemptsUseCase } from '../interfaces/IGetAllQuizAttemptsUseCase';
import { IQuizAttemptRepository } from '../../domain/IRepositories/IQuizAttemptRepository';
import { QuizAttemptResponseDto } from '../dtos/QuizAttemptResponseDto';
import { QuizAttemptMapper } from '../mappers/QuizAttemptMapper';

export class GetAllQuizAttemptsUseCase implements IGetAllQuizAttemptsUseCase {
  constructor(private quizAttemptRepository: IQuizAttemptRepository) {}

  async execute(
    courseId: string,
    userId: string,
  ): Promise<QuizAttemptResponseDto[]> {
    const attempts = await this.quizAttemptRepository.findAllByCourseAndUser(
      courseId,
      userId,
    );
    return attempts.map((a) => QuizAttemptMapper.toDto(a));
  }
}
