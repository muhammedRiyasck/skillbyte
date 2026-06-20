import { IEnrollmentWriteRepository } from '../../domain/IRepositories/IEnrollmentWriteRepository';
import { IUpdateLessonProgress } from '../interfaces/IUpdateLessonProgress';
import { ILessonRepository } from '../../../course/domain/IRepositories/ILessonRepository';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { EnrollmentStatus } from '../../../../shared/enums/EnrollmentStatus';
import { EnrollmentMapper } from '../mappers/EnrollmentMapper';
import { EnrollmentResponseDto } from '../dtos/EnrollmentResponseDto';
import { UpdateLessonProgressRequestDto } from '../dtos/UpdateLessonProgressRequestDto';
import logger from '../../../../shared/utils/Logger';

export class UpdateLessonProgressUseCase implements IUpdateLessonProgress {
  constructor(
    private enrollmentWriteRepo: IEnrollmentWriteRepository,
    private lessonRepo: ILessonRepository,
  ) {}

  async execute(
    enrollmentId: string,
    lessonId: string,
    progressData: Omit<UpdateLessonProgressRequestDto, 'lessonId'>,
  ): Promise<EnrollmentResponseDto | null> {
    if (!enrollmentId || !lessonId) {
      throw new HttpError(
        'Enrollment ID and Lesson ID are required',
        HttpStatusCode.BAD_REQUEST,
      );
    }

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

    const activeLessonIds = await this.lessonRepo.findLessonIdsByCourseId(
      updatedEnrollment.courseId,
    );
    const totalLessonsInCourse = activeLessonIds.length;

    const completedLessons = updatedEnrollment.lessonProgress.filter(
      (lp) => lp.isCompleted && activeLessonIds.includes(lp.lessonId),
    ).length;

    const progressPercentage =
      totalLessonsInCourse > 0
        ? Math.min(
            100,
            Math.round((completedLessons / totalLessonsInCourse) * 100),
          )
        : 0;

    const status =
      progressPercentage >= 100 &&
      updatedEnrollment.status !== EnrollmentStatus.COMPLETED
        ? EnrollmentStatus.COMPLETED
        : undefined;
    const completedAt =
      progressPercentage >= 100 && !updatedEnrollment.completedAt
        ? new Date()
        : undefined;

    const finalEnrollment = await this.enrollmentWriteRepo.updateProgress(
      enrollmentId,
      progressPercentage,
      status,
      completedAt,
    );

    return finalEnrollment ? EnrollmentMapper.toDto(finalEnrollment) : null;
  }
}
