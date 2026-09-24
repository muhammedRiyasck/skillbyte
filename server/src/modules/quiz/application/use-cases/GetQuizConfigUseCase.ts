import { IGetQuizConfigUseCase } from '../interfaces/IGetQuizConfigUseCase';
import { QuizConfigResponseDto } from '../dtos/QuizConfigResponseDto';
import { QuizConfigMapper } from '../mappers/QuizConfigMapper';
import { IQuizConfigRepository } from '../../domain/IRepositories/IQuizConfigRepository';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

/** Executes the business logic for get quiz config. */
export class GetQuizConfigUseCase implements IGetQuizConfigUseCase {
  constructor(private quizConfigRepository: IQuizConfigRepository) {}

  /**
   * Execute for the GetQuizConfig entity.
   *
   * @param courseId - The unique identifier for the course.
   * @param userId - The unique identifier for the user.
   * @param role - The role information.
   * @returns The standardized HTTP response.
   */
  async execute(
    courseId: string,
    userId: string,
    role: string,
  ): Promise<QuizConfigResponseDto | null> {
    const config = await this.quizConfigRepository.findByCourseId(courseId);

    if (!config) {
      return null;
    }

    // If instructor, check ownership
    if (
      role === 'instructor' &&
      config.instructorId.toString() !== userId.toString()
    ) {
      throw new HttpError(
        'Unauthorized to access this quiz configuration',
        HttpStatusCode.FORBIDDEN,
      );
    }

    return config ? QuizConfigMapper.toDto(config) : null;
  }
}
