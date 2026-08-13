import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';
import { IModuleRepository } from '../../domain/IRepositories/IModuleRepository';
import { IUpdateCourseStatusUseCase } from '../interfaces/IUpdateCourseStatusUseCase';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ILessonRepository } from '../../domain/IRepositories/ILessonRepository';
import { eventBus } from '../../../../shared/services/event-bus/EventBus';
import { COURSE_EVENTS } from '../../../../shared/services/event-bus/CourseEvents';
import { CourseStatus } from '../../../../shared/enums/CourseStatus';

export class UpdateCourseStatusUseCase implements IUpdateCourseStatusUseCase {
  constructor(
    private _courseRepo: ICourseRepository,
    private _moduleRepo: IModuleRepository,
    private _lesson: ILessonRepository,
  ) {}

  async execute(
    courseId: string,
    instructorId: string,
    status: CourseStatus,
  ): Promise<void> {
    const course = await this._courseRepo.findById(courseId);
    if (!course)
      throw new HttpError(
        ERROR_MESSAGES.COURSE_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );

    // Ownership check first — fail fast
    if (course.instructorId !== instructorId) {
      throw new HttpError(
        ERROR_MESSAGES.UNAUTHORIZED,
        HttpStatusCode.UNAUTHORIZED,
      );
    }

    // Content requirements only apply when publishing (listing) a course
    if (status === CourseStatus.LIST) {
      const modules = await this._moduleRepo.findModulesByCourseId(courseId);
      if (!modules[0] || !modules[0].moduleId) {
        throw new HttpError(
          ERROR_MESSAGES.MODULE_SHOULD_BE_THERE,
          HttpStatusCode.BAD_REQUEST,
        );
      }

      const moduleIds = modules.map((m) => m.moduleId!.toString());
      const lessons = await this._lesson.findByModuleId(moduleIds);
      if (!lessons[0] || !lessons[0].lessonId) {
        throw new HttpError(
          ERROR_MESSAGES.LESSON_SHOULD_BE_THERE,
          HttpStatusCode.BAD_REQUEST,
        );
      }
    }

    await this._courseRepo.updateStatus(courseId, status);

    // Emit event so enrolled students get notified
    const eventPayload = {
      courseId,
      courseTitle: course.title,
      instructorId,
    };

    if (status === CourseStatus.LIST) {
      eventBus.emit(COURSE_EVENTS.COURSE_PUBLISHED, eventPayload);
    } else {
      eventBus.emit(COURSE_EVENTS.COURSE_UNLISTED, eventPayload);
    }
  }
}
