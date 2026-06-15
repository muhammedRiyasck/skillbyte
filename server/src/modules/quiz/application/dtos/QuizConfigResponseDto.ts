import { QuizDifficulty } from '../../../../shared/enums/QuizDifficulty';
import { QuestionType } from '../../domain/entities/QuizConfig';

export interface QuizConfigResponseDto {
  configId?: string;
  courseId: string;
  isEnabled: boolean;
  topics: string[];
  questionCount: number;
  questionTypes: QuestionType[];
  difficulty: QuizDifficulty;
  passPercentage: number;
  maxAttempts: number;
  timeLimit: number | null;
  cachedPoolSize: number;
  questionsGeneratedAt: Date | null;
  isPoolGenerationPending: boolean;
}
