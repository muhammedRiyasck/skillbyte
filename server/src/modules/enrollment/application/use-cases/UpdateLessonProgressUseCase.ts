import { IEnrollmentReadRepository } from '../../domain/IRepositories/IEnrollmentReadRepository';
import { IEnrollmentWriteRepository } from '../../domain/IRepositories/IEnrollmentWriteRepository';
import { IUpdateLessonProgressUseCase } from '../interfaces/IUpdateLessonProgress';
import { ILessonRepository } from '../../../course/domain/IRepositories/ILessonRepository';
import { IQuizConfigRepository } from '../../../quiz/domain/IRepositories/IQuizConfigRepository';
import { IStudentRepository } from '../../../student/domain/IRepositories/IStudentRepository';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { EnrollmentStatus } from '../../../../shared/enums/EnrollmentStatus';
import { EnrollmentMapper } from '../mappers/EnrollmentMapper';
import { EnrollmentResponseDto } from '../dtos/EnrollmentResponseDto';
import { UpdateLessonProgressRequestDto } from '../dtos/UpdateLessonProgressRequestDto';
import logger from '../../../../shared/utils/Logger';

export class UpdateLessonProgressUseCase
  implements IUpdateLessonProgressUseCase
{
  constructor(
    private enrollmentReadRepo: IEnrollmentReadRepository,
    private enrollmentWriteRepo: IEnrollmentWriteRepository,
    private lessonRepo: ILessonRepository,
    private studentRepo: IStudentRepository,
    private quizConfigRepo?: IQuizConfigRepository,
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

    const previousEnrollment =
      await this.enrollmentReadRepo.findById(enrollmentId);
    if (!previousEnrollment) {
      logger.error(`Enrollment not found: ${enrollmentId}`);
      return null;
    }

    const wasCompleted = previousEnrollment.lessonProgress.find(
      (lp) => lp.lessonId.toString() === lessonId,
    )?.isCompleted;

    const updatedEnrollment =
      await this.enrollmentWriteRepo.updateLessonProgress(
        enrollmentId,
        lessonId,
        progressData,
      );

    if (!updatedEnrollment) {
      logger.error(
        `Failed to update lesson progress for enrollment: ${enrollmentId}`,
      );
      return null;
    }

    if (progressData.isCompleted && !wasCompleted) {
      await this.studentRepo.recordActivity(updatedEnrollment.userId, 10);
      logger.info(
        `Awarded 10 XP to student ${updatedEnrollment.userId} for completing lesson ${lessonId}`,
      );
    }

    const activeLessonIds = await this.lessonRepo.findLessonIdsByCourseId(
      updatedEnrollment.courseId,
    );
    const totalLessonsInCourse = activeLessonIds.length;

    // Deduplicate completed lesson IDs to prevent double counting
    const completedLessonIdSet = new Set(
      updatedEnrollment.lessonProgress
        .filter((lp) => lp.isCompleted)
        .map((lp) => lp.lessonId.toString()),
    );
    const completedLessons = activeLessonIds.filter((id) =>
      completedLessonIdSet.has(id),
    ).length;

    const allLessonsCompleted =
      totalLessonsInCourse > 0 && completedLessons >= totalLessonsInCourse;

    // Check if course has an active quiz enabled
    const quizConfig = this.quizConfigRepo
      ? await this.quizConfigRepo.findActiveByCourseId(
          updatedEnrollment.courseId,
        )
      : null;
    const isQuizEnabled = Boolean(quizConfig?.isEnabled);

    const isAlreadyCompleted =
      updatedEnrollment.status === EnrollmentStatus.COMPLETED;

    let progressPercentage =
      totalLessonsInCourse > 0
        ? Math.min(
            100,
            Math.round((completedLessons / totalLessonsInCourse) * 100),
          )
        : 0;

    if (isQuizEnabled && !isAlreadyCompleted) {
      // If quiz is enabled, completing all lessons unlocks the quiz at 99%.
      // Passing the quiz will award 100% and COMPLETED status.
      if (allLessonsCompleted) {
        progressPercentage = 99;
      } else {
        progressPercentage = Math.min(
          98,
          Math.round((completedLessons / totalLessonsInCourse) * 98),
        );
      }
    }

    const status =
      !isQuizEnabled && allLessonsCompleted && !isAlreadyCompleted
        ? EnrollmentStatus.COMPLETED
        : undefined;

    const completedAt =
      !isQuizEnabled && allLessonsCompleted && !updatedEnrollment.completedAt
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
