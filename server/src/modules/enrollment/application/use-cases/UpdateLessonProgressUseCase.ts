import { IEnrollmentWriteRepository } from '../../domain/IRepositories/IEnrollmentWriteRepository';
import { IEnrollment } from '../../domain/entities/Enrollment';
import logger from '../../../../shared/utils/Logger';
import { IUpdateLessonProgress } from '../interfaces/IUpdateLessonProgress';

export class UpdateLessonProgressUseCase implements IUpdateLessonProgress {
  constructor(private enrollmentWriteRepo: IEnrollmentWriteRepository) {}

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

    // 1. Update lesson progress in repository (data-only operation)
    const updatedEnrollment =
      await this.enrollmentWriteRepo.updateLessonProgress(
        enrollmentId,
        lessonId,
        progressData,
      );

    if (!updatedEnrollment) {
      logger.error(`Enrollment not found: ${enrollmentId}`);
      return null;
    }

    const completedLessons = updatedEnrollment.lessonProgress.filter(
      (lp) => lp.isCompleted,
    ).length;
    const totalLessonsInProgress = updatedEnrollment.lessonProgress.length;
    const progressPercentage =
      totalLessonsInProgress > 0
        ? Math.round((completedLessons / totalLessonsInProgress) * 100)
        : 0;
    // 3. Update overall progress
    const status =
      progressPercentage === 100 && updatedEnrollment.status !== 'completed'
        ? 'completed'
        : undefined;
    const completedAt =
      progressPercentage === 100 && !updatedEnrollment.completedAt
        ? new Date()
        : undefined;

    return await this.enrollmentWriteRepo.updateProgress(
      enrollmentId,
      progressPercentage,
      status,
      completedAt,
    );
  }
}
