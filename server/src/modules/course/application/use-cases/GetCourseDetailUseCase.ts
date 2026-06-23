import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';
import { IModuleRepository } from '../../domain/IRepositories/IModuleRepository';
import { ILessonRepository } from '../../domain/IRepositories/ILessonRepository';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';
import { IQuizConfigRepository } from '../../../quiz/domain/IRepositories/IQuizConfigRepository';
import { IEnrollmentReadRepository } from '../../../enrollment/domain/IRepositories/IEnrollmentReadRepository';
import { Course } from '../../domain/entities/Course';
import { IGetCourseUseCase } from '../interfaces/IGetCourseDetailsUseCase';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';
import { UserRole } from '../../../../shared/enums/UserRole';
import { CourseStatus } from '../../../../shared/enums/CourseStatus';
import { GetCourseDto } from '../dtos/CourseDto';
import { CourseResponseDto } from '../dtos/CourseResponseDto';
import { CourseMapper } from '../mappers/CourseMapper';

/**
 * Use case for retrieving detailed course information with optional includes.
 */
export class GetCourseDetailUseCase implements IGetCourseUseCase {
  constructor(
    private _courseRepo: ICourseRepository,
    private _moduleRepo: IModuleRepository,
    private _lessonRepo: ILessonRepository,
    private _instructorRepo: IInstructorRepository,
    private _quizConfigRepo: IQuizConfigRepository,
    private _enrollmentRepo: IEnrollmentReadRepository,
  ) {}

  async execute(dto: GetCourseDto): Promise<CourseResponseDto | null> {
    const { courseId, role, include, userId } = dto;

    const course = await this._courseRepo.findById(courseId);
    if (!course) {
      throw new HttpError(
        ERROR_MESSAGES.COURSE_NOT_FOUND,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const validRoles: UserRole[] = [
      UserRole.INSTRUCTOR,
      UserRole.STUDENT,
      UserRole.ADMIN,
    ];
    if (!validRoles.includes(role as UserRole)) {
      throw new HttpError(
        ERROR_MESSAGES.INVALID_ROLE,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    if (role === UserRole.INSTRUCTOR) {
      if (!userId || course.instructorId !== userId) {
        throw new HttpError(
          'You can only view your own courses.',
          HttpStatusCode.FORBIDDEN,
        );
      }
    }

    if (role === UserRole.STUDENT && course.status !== CourseStatus.LIST) {
      if (userId) {
        const enrollment = await this._enrollmentRepo.findEnrollment(
          userId,
          courseId,
        );
        if (!enrollment) {
          throw new HttpError(
            ERROR_MESSAGES.COURSE_UNLISTED_OR_NOT_AVAILABLE,
            HttpStatusCode.FORBIDDEN,
          );
        }
      } else {
        throw new HttpError(
          ERROR_MESSAGES.COURSE_UNLISTED_OR_NOT_AVAILABLE,
          HttpStatusCode.FORBIDDEN,
        );
      }
    }

    const includeArr = include ? include.split(',') : [];

    if (includeArr.includes('modules')) {
      const modules = await this._moduleRepo.findModulesByCourseId(courseId);

      if (includeArr.includes('lessons')) {
        const moduleIds = modules.map((m) => m.moduleId!.toString());
        const lessons = await this._lessonRepo.findByModuleId(moduleIds);

        modules.forEach((mod) => {
          mod.lessons = lessons.filter(
            (les) => les.moduleId.toString() === mod.moduleId,
          );
        });
      }

      course.modules = modules;
    }

    if (includeArr.includes('instructor')) {
      const instructor = await this._instructorRepo.findById(
        course.instructorId,
      );
      if (instructor) {
        (
          course as Course & { instructor: Record<string, unknown> }
        ).instructor = {
          name: instructor.name,
          title: instructor.jobTitle,
          avatar: instructor.profilePictureUrl,
          bio: instructor.bio,
          averageRating: instructor.averageRating,
          totalReviews: instructor.totalReviews,
        };
      }
    }

    const quizConfig = await this._quizConfigRepo.findByCourseId(courseId);
    course.isQuizEnabled = quizConfig?.isEnabled || false;

    return CourseMapper.toDetailsResponse(
      course as Course & { instructor?: unknown },
    );
  }
}
