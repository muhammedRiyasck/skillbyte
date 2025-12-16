import { IEnrollment } from '../../infrastructure/models/EnrollmentModel';
import { IEnrollmentRepository } from '../../domain/IEnrollmentRepository';

export class UpdateLessonProgress {
  constructor(private enrollmentRepository: IEnrollmentRepository) {}

  async execute(
    enrollmentId: string,
    lessonId: string,
    progressData: {
      lastWatchedSecond: number;
      totalDuration: number;
      isCompleted: boolean;
    },
  ): Promise<IEnrollment | null> {
    if (!enrollmentId || !lessonId) {
      throw new Error('Enrollment ID and Lesson ID are required');
    }

    return await this.enrollmentRepository.updateLessonProgress(
      enrollmentId,
      lessonId,
      progressData,
    );
  }
}
