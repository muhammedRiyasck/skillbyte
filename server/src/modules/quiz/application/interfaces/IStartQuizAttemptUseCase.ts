import { QuizAttemptResponseDto } from '../dtos/QuizAttemptResponseDto';

export interface IStartQuizAttemptUseCase {
  execute(courseId: string, userId: string): Promise<QuizAttemptResponseDto>;
}
