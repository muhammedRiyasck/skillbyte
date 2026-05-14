import { IGetAllQuizAttemptsUseCase } from '../interfaces/IGetAllQuizAttemptsUseCase';
import { IQuizAttemptRepository } from '../../domain/IRepositories/IQuizAttemptRepository';
import { IQuizAttempt } from '../../domain/entities/QuizAttempt';

export class GetAllQuizAttemptsUseCase implements IGetAllQuizAttemptsUseCase {
  constructor(private quizAttemptRepository: IQuizAttemptRepository) {}

  async execute(courseId: string, userId: string): Promise<IQuizAttempt[]> {
    return this.quizAttemptRepository.findAllByCourseAndUser(courseId, userId);
  }
}
