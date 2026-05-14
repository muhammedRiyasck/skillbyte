import { IResetStudentQuizAttemptsUseCase } from '../interfaces/IResetStudentQuizAttemptsUseCase';
import { IQuizAttemptRepository } from '../../domain/IRepositories/IQuizAttemptRepository';
import { IQuizConfigRepository } from '../../domain/IRepositories/IQuizConfigRepository';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

export class ResetStudentQuizAttemptsUseCase
  implements IResetStudentQuizAttemptsUseCase
{
  constructor(
    private quizAttemptRepository: IQuizAttemptRepository,
    private quizConfigRepository: IQuizConfigRepository,
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

    await this.quizAttemptRepository.deleteAttemptsByCourseAndUser(
      courseId,
      studentId,
    );
  }
}
