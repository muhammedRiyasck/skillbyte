import { ILessonRepository } from '../../domain/IRepositories/ILessonRepository';
import { IModuleRepository } from '../../domain/IRepositories/IModuleRepository';
import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';
import { Lesson } from '../../domain/entities/Lesson';
import { IUpdateLessonUseCase } from '../interfaces/IUpdateLessonUseCase';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

/** Executes the business logic for update lesson. */
export class UpdateLessonUseCase implements IUpdateLessonUseCase {
  /**
   * Constructs a new UpdateLessonUseCase instance.
   * @param lessonRepo - The repository for lesson data operations.
   * @param moduleRepo - The repository for module data operations.
   * @param courseRepo - The repository for course data operations.
   */
  constructor(
    private _lessonRepo: ILessonRepository,
    private _moduleRepo: IModuleRepository,
    private _courseRepo: ICourseRepository,
  ) {}

  /**
   * Execute for the UpdateLesson entity.
   *
   * @param lessonId - The unique identifier for the lesson.
   * @param instructorId - The unique identifier for the instructor.
   * @param updates - The updates information.
   */
  async execute(
    lessonId: string,
    instructorId: string,
    updates: Partial<Omit<Lesson, 'createdAt' | 'updatedAt' | 'courseId'>>,
  ): Promise<void> {
    // Find the lesson to ensure it exists
    const lesson = await this._lessonRepo.findById(lessonId);
    if (!lesson) {
      throw new HttpError(
        ERROR_MESSAGES.LESSON_NOT_FOUND,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // Find the original module to ensure it exists
    const module = await this._moduleRepo.findById(lesson.moduleId.toString());
    if (!module) {
      throw new HttpError(
        ERROR_MESSAGES.MODULE_NOT_FOUND,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // Find the original course and check if the instructor owns it
    const course = await this._courseRepo.findById(module.courseId);
    if (!course || course.instructorId !== instructorId) {
      throw new HttpError(
        ERROR_MESSAGES.UNAUTHORIZED_UPDATE_LESSON,
        HttpStatusCode.FORBIDDEN,
      );
    }

    // Guard: if moduleId is being changed, verify the instructor owns the NEW module's course too
    if (
      updates.moduleId &&
      updates.moduleId.toString() !== lesson.moduleId.toString()
    ) {
      const newModule = await this._moduleRepo.findById(
        updates.moduleId.toString(),
      );
      if (!newModule) {
        throw new HttpError(
          ERROR_MESSAGES.MODULE_NOT_FOUND,
          HttpStatusCode.BAD_REQUEST,
        );
      }
      const newCourse = await this._courseRepo.findById(newModule.courseId);
      if (!newCourse || newCourse.instructorId !== instructorId) {
        throw new HttpError(
          ERROR_MESSAGES.UNAUTHORIZED_UPDATE_LESSON,
          HttpStatusCode.FORBIDDEN,
        );
      }
    }

    await this._lessonRepo.updateLessonById(lessonId, updates);
  }
}
