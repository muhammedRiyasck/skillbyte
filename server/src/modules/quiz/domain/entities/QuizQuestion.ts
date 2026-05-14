import { QuizDifficulty } from '../../../../shared/enums/QuizDifficulty';

export interface IBaseQuestion {
  questionId: string;
  type: 'mcq' | 'true_false' | 'short_answer' | 'essay';
  questionText: string;
  topicTag: string;
  difficulty: QuizDifficulty;
  explanation: string;
}

export interface IMCQQuestion extends IBaseQuestion {
  type: 'mcq';
  options: [string, string, string, string];
  correctOptionIndex: 0 | 1 | 2 | 3;
}

export interface ITrueFalseQuestion extends IBaseQuestion {
  type: 'true_false';
  correctAnswer: boolean;
}

export interface IShortAnswerQuestion extends IBaseQuestion {
  type: 'short_answer';
  modelAnswer: string;
  maxWords: number;
}

export interface IEssayQuestion extends IBaseQuestion {
  type: 'essay';
  rubric: string;
  maxWords: number;
}

export type QuizQuestion =
  | IMCQQuestion
  | ITrueFalseQuestion
  | IShortAnswerQuestion
  | IEssayQuestion;
