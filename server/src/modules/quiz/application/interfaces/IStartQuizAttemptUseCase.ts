import { IQuizAttempt } from '../../domain/entities/QuizAttempt';

export interface IStartQuizAttemptUseCase {
  execute(courseId: string, userId: string): Promise<IQuizAttempt>;
}
