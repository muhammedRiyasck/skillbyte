import { IQuizAttempt } from '../../domain/entities/QuizAttempt';

export interface IGetAllQuizAttemptsUseCase {
  execute(courseId: string, userId: string): Promise<IQuizAttempt[]>;
}
