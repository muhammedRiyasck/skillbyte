import { QuizQuestion } from '../../../modules/quiz/domain/entities/QuizQuestion';
import { QuizDifficulty } from '../../enums/QuizDifficulty';
import { QuestionType } from '../../../modules/quiz/domain/entities/QuizConfig';

export interface IGenerateQuestionsInput {
  courseTitle: string;
  topics: string[];
  questionCount: number;
  difficulty: QuizDifficulty;
  questionTypes: QuestionType[];
}

export interface IGenerateFeedbackInput {
  score: number;
  topics: string[];
  passed: boolean;
  weakAreas: string[];
  strongAreas: string[];
}

export interface IAIQuizService {
  generateQuestions(input: IGenerateQuestionsInput): Promise<QuizQuestion[]>;
  generateFeedbackSummary(input: IGenerateFeedbackInput): Promise<string>;
}
