import { IQuizAttempt } from '../entities/QuizAttempt';

export interface IQuizAttemptRepository {
  create(attempt: IQuizAttempt): Promise<IQuizAttempt>;
  update(
    attemptId: string,
    updates: Partial<IQuizAttempt>,
  ): Promise<IQuizAttempt | null>;
  findById(attemptId: string): Promise<IQuizAttempt | null>;
  findLatestByCourseAndUser(
    courseId: string,
    userId: string,
  ): Promise<IQuizAttempt | null>;
  countAttemptsByUser(courseId: string, userId: string): Promise<number>;
  findAllByCourseId(courseId: string): Promise<IQuizAttempt[]>;
  findAllByCourseAndUser(
    courseId: string,
    userId: string,
  ): Promise<IQuizAttempt[]>;
  deleteAttemptsByCourseAndUser(
    courseId: string,
    userId: string,
  ): Promise<void>;
  findAttemptsWithStudentDetails(courseId: string): Promise<unknown[]>;
}
