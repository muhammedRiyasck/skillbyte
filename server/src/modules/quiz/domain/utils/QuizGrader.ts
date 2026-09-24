import { QuizQuestion } from '../entities/QuizQuestion';
import { StudentAnswer } from '../entities/StudentAnswer';
import { IQuestionGradingStrategy } from '../strategies/IQuestionGradingStrategy';
import { McqGradingStrategy } from '../strategies/McqGradingStrategy';
import { TrueFalseGradingStrategy } from '../strategies/TrueFalseGradingStrategy';

/** Handles quiz grader functionality. */
export class QuizGrader {
  private static strategies: Map<string, IQuestionGradingStrategy> = new Map([
    ['mcq', new McqGradingStrategy()],
    ['true_false', new TrueFalseGradingStrategy()],
  ]);

  /**
   * Register strategy for the QuizGrader entity.
   *
   * @param type - The type information.
   * @param strategy - The strategy information.
   */
  static registerStrategy(
    type: string,
    strategy: IQuestionGradingStrategy,
  ): void {
    this.strategies.set(type, strategy);
  }

  /**
   * Grade answer for the QuizGrader entity.
   *
   * @param question - The question information.
   * @param answer - The answer information.
   * @returns The result of the operation.
   */
  static gradeAnswer(question: QuizQuestion, answer: StudentAnswer): boolean {
    if (question.type !== answer.type) return false;

    const strategy = this.strategies.get(question.type);
    if (!strategy) {
      // Questions without an automated grading strategy (e.g. short_answer, essay) return false
      return false;
    }

    return strategy.grade(question, answer);
  }
}
