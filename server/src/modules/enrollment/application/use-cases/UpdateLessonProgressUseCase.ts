import { IEnrollmentWriteRepository } from '../../domain/IRepositories/IEnrollmentWriteRepository';
import { IEnrollment } from '../../domain/entities/Enrollment';
import logger from '../../../../shared/utils/Logger';
import { IUpdateLessonProgress } from '../interfaces/IUpdateLessonProgress';
import { ILessonRepository } from '../../../course/domain/IRepositories/ILessonRepository';

export class UpdateLessonProgressUseCase implements IUpdateLessonProgress {
  constructor(
    private enrollmentWriteRepo: IEnrollmentWriteRepository,
    private lessonRepo: ILessonRepository,
  ) {}

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

    // 2. Get total lessons in the course
    const totalLessonsInCourse = await this.lessonRepo.countByCourseId(
      updatedEnrollment.courseId,
    );

    // 3. Calculate progress based on total course lessons
    const completedLessons = updatedEnrollment.lessonProgress.filter(
      (lp) => lp.isCompleted,
    ).length;
    const progressPercentage =
      totalLessonsInCourse > 0
        ? Math.round((completedLessons / totalLessonsInCourse) * 100)
        : 0;

    // 4. Update overall progress
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
