import { IEnrollment } from '../entities/Enrollment';

export interface IEnrollmentWriteRepository {
  save(enrollment: Partial<IEnrollment>): Promise<IEnrollment>;
  updateEnrollmentStatus(
    enrollmentId: string,
    status: string,
  ): Promise<IEnrollment | null>;
  updateLessonProgress(
    enrollmentId: string,
    lessonId: string,
    progressData: {
      lastWatchedSecond: number;
      totalDuration: number;
      isCompleted: boolean;
    },
  ): Promise<IEnrollment | null>;
  updateProgress(
    enrollmentId: string,
    progress: number,
    status?: string,
    completedAt?: Date,
  ): Promise<IEnrollment | null>;
}
