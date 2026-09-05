import { QuizQuestion, IMCQQuestion } from '../entities/QuizQuestion';
import { StudentAnswer, IMCQAnswer } from '../entities/StudentAnswer';
import { IQuestionGradingStrategy } from './IQuestionGradingStrategy';

export class McqGradingStrategy implements IQuestionGradingStrategy {
  grade(question: QuizQuestion, answer: StudentAnswer): boolean {
    if (question.type !== 'mcq' || answer.type !== 'mcq') {
      return false;
    }
    const mcqQuestion = question as IMCQQuestion;
    const mcqAnswer = answer as IMCQAnswer;
    return mcqQuestion.correctOptionIndex === mcqAnswer.selectedOptionIndex;
  }
}
