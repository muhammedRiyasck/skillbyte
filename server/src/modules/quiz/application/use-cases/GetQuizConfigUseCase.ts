import { IGetQuizConfigUseCase } from '../interfaces/IGetQuizConfigUseCase';
import { IQuizConfig } from '../../domain/entities/QuizConfig';
import { IQuizConfigRepository } from '../../domain/IRepositories/IQuizConfigRepository';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

export class GetQuizConfigUseCase implements IGetQuizConfigUseCase {
  constructor(private quizConfigRepository: IQuizConfigRepository) {}

  async execute(
    courseId: string,
    userId: string,
    role: string,
  ): Promise<IQuizConfig | null> {
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

    // If student, we could potentially check enrollment here,
    // but the landing page already handles the basic "is enabled" check.
    // For now, allowing all students to see the config (topics, count etc) is fine.

    return config;
  }
}
