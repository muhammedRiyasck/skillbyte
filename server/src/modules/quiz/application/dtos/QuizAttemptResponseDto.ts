export interface QuizAttemptResponseDto {
  attemptId: string;
  configId: string;
  courseId: string;
  userId: string;
  attemptNumber: number;
  status: string;
  questions: unknown[]; // Or a specific Question DTO
  answers: unknown[];
  perQuestionResult: unknown[];
  score: number;
  passed: boolean;
  aiFeedback: string;
  startedAt: Date;
  submittedAt?: Date;
}
