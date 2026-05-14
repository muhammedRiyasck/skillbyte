import { IQuizAttempt } from '../../domain/entities/QuizAttempt';

export interface IGetQuizResultUseCase {
  execute(courseId: string, userId: string): Promise<IQuizAttempt | null>;
}
