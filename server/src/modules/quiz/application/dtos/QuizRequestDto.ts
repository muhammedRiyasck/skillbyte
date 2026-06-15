import { QuizDifficulty } from '../../../../shared/enums/QuizDifficulty';
import { QuestionType } from '../../domain/entities/QuizConfig';
import { StudentAnswer } from '../../domain/entities/StudentAnswer';

export interface CreateQuizConfigRequestDto {
  courseId: string;
  isEnabled?: boolean;
  topics: string[];
  questionCount: number;
  questionTypes: QuestionType[];
  difficulty: QuizDifficulty;
  passPercentage: number;
  maxAttempts: number;
  timeLimit: number | null;
}

export type UpdateQuizConfigRequestDto = Partial<
  Omit<CreateQuizConfigRequestDto, 'courseId'>
>;

export interface SubmitQuizAttemptRequestDto {
  answers: StudentAnswer[];
}
