import { QuizQuestion, IMCQQuestion } from '../entities/QuizQuestion';
import { StudentAnswer, IMCQAnswer } from '../entities/StudentAnswer';
import { IQuestionGradingStrategy } from './IQuestionGradingStrategy';

/** Handles mcq grading strategy functionality. */
export class McqGradingStrategy implements IQuestionGradingStrategy {
  /**
   * Grade for the McqGradingStrategy entity.
   *
   * @param question - The question information.
   * @param answer - The answer information.
   * @returns The result of the operation.
   */
  grade(question: QuizQuestion, answer: StudentAnswer): boolean {
    if (question.type !== 'mcq' || answer.type !== 'mcq') {
      return false;
    }
    const mcqQuestion = question as IMCQQuestion;
    const mcqAnswer = answer as IMCQAnswer;
    return mcqQuestion.correctOptionIndex === mcqAnswer.selectedOptionIndex;
  }
}
