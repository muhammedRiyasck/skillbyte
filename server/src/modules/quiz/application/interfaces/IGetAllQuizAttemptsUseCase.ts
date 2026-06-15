import { QuizAttemptResponseDto } from '../dtos/QuizAttemptResponseDto';

export interface IGetAllQuizAttemptsUseCase {
  execute(courseId: string, userId: string): Promise<QuizAttemptResponseDto[]>;
}
