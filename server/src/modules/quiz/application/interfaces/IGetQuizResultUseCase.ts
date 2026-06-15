import { QuizAttemptResponseDto } from '../dtos/QuizAttemptResponseDto';

export interface IGetQuizResultUseCase {
  execute(
    courseId: string,
    userId: string,
  ): Promise<QuizAttemptResponseDto | null>;
}
