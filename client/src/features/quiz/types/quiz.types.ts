export type QuizDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';
export type QuestionType = 'mcq' | 'true_false' | 'short_answer' | 'essay';

export interface IQuizConfig {
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
  hasCachedQuestions: boolean;
  isPoolGenerationPending?: boolean;
  questionsGeneratedAt: string | null;
}

export interface IAttemptDetail {
  attemptNumber: number;
  score: number;
  correctAnswersCount: number;
  totalQuestions: number;
  passed: boolean;
  status: string;
  startedAt: string;
  submittedAt?: string;
}

export interface IStudentQuizSummary {
  userId: string;
  name: string;
  email: string;
  profilePicture?: string;
  attemptsCount: number;
  bestScore: number;
  passed: boolean;
  overallStatus: 'PASSED' | 'FAILED' | 'IN_PROGRESS';
  attempts: IAttemptDetail[];
  lastAttemptAt: string;
}

export interface IQuizQuestion {
  questionId: string;
  questionText: string;
  type: QuestionType;
  options?: string[];
  correctOptionIndex?: number;
  correctAnswer?: boolean;
  explanation?: string;
}

export interface IAnswer {
  questionId: string;
  type: QuestionType;
  selectedOptionIndex?: number;
  selectedAnswer?: boolean;
}

export interface IQuizAttempt {
  _id?: string;
  id?: string;
  attemptId?: string;
  courseId: string;
  userId: string;
  attemptNumber: number;
  status: 'in_progress' | 'completed' | 'failed';
  score: number;
  passed: boolean;
  questions: IQuizQuestion[];
  answers: IAnswer[];
  perQuestionResult?: {
    questionId: string;
    isCorrect: boolean;
  }[];
  aiFeedback?: string;
  startedAt: string;
  completedAt?: string;
}

export interface IQuizAnalytics {
  totalStudents: number;
  averageScore: number;
  passRate: number;
  studentAttempts: IStudentQuizSummary[];
  totalPages: number;
  currentPage: number;
  passPercentage: number;
}
