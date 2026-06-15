export interface AttemptDetailDto {
  attemptNumber: number;
  score: number;
  correctAnswersCount: number;
  totalQuestions: number;
  passed: boolean;
  status: string;
  startedAt: Date;
  submittedAt?: Date;
}

export interface StudentQuizSummaryDto {
  userId: string;
  name: string;
  email: string;
  profilePicture?: string;
  attemptsCount: number;
  bestScore: number;
  passed: boolean;
  overallStatus: 'PASSED' | 'FAILED' | 'IN_PROGRESS';
  attempts: AttemptDetailDto[];
  lastAttemptAt: Date;
}

export interface QuizAnalyticsResponseDto {
  totalStudents: number;
  averageScore: number;
  passRate: number;
  studentAttempts: StudentQuizSummaryDto[];
  currentPage: number;
  totalPages: number;
  passPercentage: number;
}
