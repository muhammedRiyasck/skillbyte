import { IEnrollment } from '../../domain/entities/Enrollment';

export interface IUpdateLessonProgress {
  execute(
    enrollmentId: string,
    lessonId: string,
    metaData: {
      lastWatchedSecond: number;
      totalDuration: number;
      isCompleted: boolean;
    },
  ): Promise<IEnrollment | null>;
}
