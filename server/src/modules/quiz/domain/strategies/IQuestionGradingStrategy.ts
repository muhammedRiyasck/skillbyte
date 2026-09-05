import { QuizQuestion } from '../entities/QuizQuestion';
import { StudentAnswer } from '../entities/StudentAnswer';

export interface IQuestionGradingStrategy {
  grade(question: QuizQuestion, answer: StudentAnswer): boolean;
}
