import { ILessonRepository } from '../../domain/IRepositories/ILessonRepository';
import { IModuleRepository } from '../../domain/IRepositories/IModuleRepository';
import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';
import { Lesson } from '../../domain/entities/Lesson';
import { IUpdateLessonUseCase } from '../interfaces/IUpdateLessonUseCase';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

/**
 * Use case for updating lesson information.
 * Handles the business logic for updating lesson details, including validation of ownership through module and course.
 */
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
   * Executes the lesson update logic.
   * Validates the lesson exists, the module exists, and the instructor owns the course, then updates the lesson.
   * @param lessonId - The ID of the lesson to update.
   * @param instructorId - The ID of the instructor making the update.
   * @param updates - The partial lesson data to update.
   * @returns A promise that resolves when the update is complete.
   * @throws HttpError with appropriate status code if validation fails or access is denied.
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

    // Find the module to ensure it exists
    const module = await this._moduleRepo.findById(lesson.moduleId.toString());
    if (!module) {
      throw new HttpError(
        ERROR_MESSAGES.MODULE_NOT_FOUND,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // Find the course and check if the instructor owns it
    const course = await this._courseRepo.findById(module.courseId);
    if (!course || course.instructorId !== instructorId) {
      throw new HttpError(
        ERROR_MESSAGES.UNAUTHORIZED_UPDATE_LESSON,
        HttpStatusCode.FORBIDDEN,
      );
    }

    // Update the lesson with the provided data
    await this._lessonRepo.updateLessonById(lessonId, updates);
  }
}
