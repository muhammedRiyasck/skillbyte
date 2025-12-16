import { IEnrollment } from '../../infrastructure/models/EnrollmentModel';

export interface IUpdateLessonProgressUseCase {
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
