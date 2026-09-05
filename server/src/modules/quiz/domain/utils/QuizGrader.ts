import { QuizQuestion } from '../entities/QuizQuestion';
import { StudentAnswer } from '../entities/StudentAnswer';
import { IQuestionGradingStrategy } from '../strategies/IQuestionGradingStrategy';
import { McqGradingStrategy } from '../strategies/McqGradingStrategy';
import { TrueFalseGradingStrategy } from '../strategies/TrueFalseGradingStrategy';

export class QuizGrader {
  private static strategies: Map<string, IQuestionGradingStrategy> = new Map([
    ['mcq', new McqGradingStrategy()],
    ['true_false', new TrueFalseGradingStrategy()],
  ]);

  /**
   * Registers a new grading strategy for a question type (enables OCP extension).
   */
  static registerStrategy(
    type: string,
    strategy: IQuestionGradingStrategy,
  ): void {
    this.strategies.set(type, strategy);
  }

  /**
   * Grades a single student answer against the corresponding quiz question.
   *
   * @param question The quiz question object containing correct answer details
   * @param answer The student's submitted answer
   * @returns true if the answer is correct, false otherwise
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
