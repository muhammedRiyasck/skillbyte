import { QuizQuestion, ITrueFalseQuestion } from '../entities/QuizQuestion';
import { StudentAnswer, ITrueFalseAnswer } from '../entities/StudentAnswer';
import { IQuestionGradingStrategy } from './IQuestionGradingStrategy';

/** Handles true false grading strategy functionality. */
export class TrueFalseGradingStrategy implements IQuestionGradingStrategy {
  /**
   * Grade for the TrueFalseGradingStrategy entity.
   *
   * @param question - The question information.
   * @param answer - The answer information.
   * @returns The result of the operation.
   */
  grade(question: QuizQuestion, answer: StudentAnswer): boolean {
    if (question.type !== 'true_false' || answer.type !== 'true_false') {
      return false;
    }
    const tfQuestion = question as ITrueFalseQuestion;
    const tfAnswer = answer as ITrueFalseAnswer;
    return tfQuestion.correctAnswer === tfAnswer.selectedAnswer;
  }
}
