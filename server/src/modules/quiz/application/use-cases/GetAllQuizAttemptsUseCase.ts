import { IGetAllQuizAttemptsUseCase } from '../interfaces/IGetAllQuizAttemptsUseCase';
import { IQuizAttemptRepository } from '../../domain/IRepositories/IQuizAttemptRepository';
import { QuizAttemptResponseDto } from '../dtos/QuizAttemptResponseDto';
import { QuizAttemptMapper } from '../mappers/QuizAttemptMapper';

/** Executes the business logic for get all quiz attempts. */
export class GetAllQuizAttemptsUseCase implements IGetAllQuizAttemptsUseCase {
  constructor(private quizAttemptRepository: IQuizAttemptRepository) {}

  /**
   * Execute for the GetAllQuizAttempts entity.
   *
   * @param courseId - The unique identifier for the course.
   * @param userId - The unique identifier for the user.
   * @returns The standardized HTTP response.
   */
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
