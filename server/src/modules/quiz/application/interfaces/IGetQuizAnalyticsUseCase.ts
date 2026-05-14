export interface IAttemptDetail {
  attemptNumber: number;
  score: number;
  correctAnswersCount: number;
  totalQuestions: number;
  passed: boolean;
  status: string;
  startedAt: Date;
  submittedAt?: Date;
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
  lastAttemptAt: Date;
}

export interface IQuizAnalyticsDto {
  totalStudents: number;
  averageScore: number;
  passRate: number;
  studentAttempts: IStudentQuizSummary[];
  currentPage: number;
  totalPages: number;
  passPercentage: number;
}

export interface IGetQuizAnalyticsUseCase {
  execute(
    courseId: string,
    instructorId: string,
    page?: number,
    limit?: number,
  ): Promise<IQuizAnalyticsDto>;
}
