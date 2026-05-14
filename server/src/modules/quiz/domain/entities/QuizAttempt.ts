import { QuizStatus } from '../../../../shared/enums/QuizStatus';
import { QuizQuestion } from './QuizQuestion';
import { StudentAnswer } from './StudentAnswer';

export interface IPerQuestionResult {
  questionId: string;
  isCorrect: boolean;
  scoreAwarded?: number;
}

export interface IQuizAttempt {
  attemptId?: string;
  configId: string;
  courseId: string;
  userId: string;
  attemptNumber: number;
  status: QuizStatus;
  questions: QuizQuestion[];
  answers: StudentAnswer[];
  perQuestionResult: IPerQuestionResult[];
  score: number;
  passed: boolean;
  aiFeedback: string;
  startedAt: Date;
  submittedAt?: Date;
}
