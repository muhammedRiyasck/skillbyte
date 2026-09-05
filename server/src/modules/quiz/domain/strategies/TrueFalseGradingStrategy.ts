import { QuizQuestion, ITrueFalseQuestion } from '../entities/QuizQuestion';
import { StudentAnswer, ITrueFalseAnswer } from '../entities/StudentAnswer';
import { IQuestionGradingStrategy } from './IQuestionGradingStrategy';

export class TrueFalseGradingStrategy implements IQuestionGradingStrategy {
  grade(question: QuizQuestion, answer: StudentAnswer): boolean {
    if (question.type !== 'true_false' || answer.type !== 'true_false') {
      return false;
    }
    const tfQuestion = question as ITrueFalseQuestion;
    const tfAnswer = answer as ITrueFalseAnswer;
    return tfQuestion.correctAnswer === tfAnswer.selectedAnswer;
  }
}
