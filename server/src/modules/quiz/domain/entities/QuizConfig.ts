import { QuizDifficulty } from '../../../../shared/enums/QuizDifficulty';
import { QuizQuestion } from './QuizQuestion';

export type QuestionType = 'mcq' | 'true_false' | 'short_answer' | 'essay';

export interface IQuizConfig {
  configId?: string;
  courseId: string;
  instructorId: string;
  isEnabled: boolean;
  topics: string[];
  questionCount: number;
  questionTypes: QuestionType[];
  difficulty: QuizDifficulty;
  passPercentage: number;
  maxAttempts: number;
  timeLimit: number | null;
  cachedQuestions: QuizQuestion[] | null;
  questionsGeneratedAt: Date | null;
  isPoolGenerationPending: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
