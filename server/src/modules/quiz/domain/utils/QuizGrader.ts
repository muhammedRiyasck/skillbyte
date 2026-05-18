import { QuizQuestion } from '../entities/QuizQuestion';
import { StudentAnswer } from '../entities/StudentAnswer';

export class QuizGrader {
  /**
   * Grades a single student answer against the corresponding quiz question.
   *
   * @param question The quiz question object containing correct answer details
   * @param answer The student's submitted answer
   * @returns true if the answer is correct, false otherwise
   */
  static gradeAnswer(question: QuizQuestion, answer: StudentAnswer): boolean {
    if (question.type !== answer.type) return false;

    switch (question.type) {
      case 'mcq':
        if (answer.type === 'mcq') {
          return question.correctOptionIndex === answer.selectedOptionIndex;
        }
        return false;
      case 'true_false':
        if (answer.type === 'true_false') {
          return question.correctAnswer === answer.selectedAnswer;
        }
        return false;
      case 'short_answer':
      case 'essay':
        // Phase 2 implementation for manual/AI grading
        return false;
      default:
        return false;
    }
  }
}
