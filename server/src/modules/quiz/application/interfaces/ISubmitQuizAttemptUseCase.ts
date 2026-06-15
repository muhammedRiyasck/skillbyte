import { QuizAttemptResponseDto } from '../dtos/QuizAttemptResponseDto';
import { StudentAnswer } from '../../domain/entities/StudentAnswer';

export interface ISubmitQuizAttemptUseCase {
  execute(
    attemptId: string,
    userId: string,
    answers: StudentAnswer[],
  ): Promise<QuizAttemptResponseDto>;
}
