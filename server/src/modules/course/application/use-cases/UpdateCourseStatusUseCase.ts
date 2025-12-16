import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';
import { IModuleRepository } from '../../domain/IRepositories/IModuleRepository';
import { IUpdateCourseStatusUseCase } from '../interfaces/IUpdateCourseStatusUseCase';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ILessonRepository } from '../../domain/IRepositories/ILessonRepository';

export class UpdateCourseStatusUseCase implements IUpdateCourseStatusUseCase {
  constructor(
    private _courseRepo: ICourseRepository,
    private _moduleRepo: IModuleRepository,
    private _lesson: ILessonRepository,
  ) {}

  async execute(
    courseId: string,
    instructorId: string,
    status: 'list' | 'unlist',
  ): Promise<void> {
    const course = await this._courseRepo.findById(courseId);
    if (!course)
      throw new HttpError(
        ERROR_MESSAGES.COURSE_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
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
    if (course.instructorId !== instructorId) {
      throw new HttpError(
        ERROR_MESSAGES.UNAUTHORIZED,
        HttpStatusCode.UNAUTHORIZED,
      );
    }

    await this._courseRepo.updateStatus(courseId, status);
  }
}
