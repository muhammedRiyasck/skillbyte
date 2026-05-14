import { IQuizAttempt } from '../../domain/entities/QuizAttempt';
import { StudentAnswer } from '../../domain/entities/StudentAnswer';

export interface ISubmitQuizAttemptUseCase {
  execute(
    attemptId: string,
    userId: string,
    answers: StudentAnswer[],
  ): Promise<IQuizAttempt>;
}
