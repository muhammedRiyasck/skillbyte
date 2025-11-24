import { ILessonRepository } from "../../domain/IRepositories/ILessonRepository";
import { IModuleRepository } from "../../domain/IRepositories/IModuleRepository";
import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";
import { IDeleteLessonUseCase } from "../interfaces/IDeleteLessonUseCase";
import { ERROR_MESSAGES } from "../../../../shared/constants/messages";
import { HttpError } from "../../../../shared/types/HttpError";
import { HttpStatusCode } from "../../../../shared/enums/HttpStatusCodes";

/**
 * Use case for deleting a lesson.
 * Handles the business logic for lesson deletion, ensuring the lesson exists and the instructor owns the associated course.
 */
export class DeleteLessonUseCase implements IDeleteLessonUseCase {
  /**
   * Constructs a new DeleteLessonUseCase instance.
   * @param lessonRepo - The repository for lesson data operations.
   * @param moduleRepo - The repository for module data operations.
   * @param courseRepo - The repository for course data operations.
   */
  constructor(
    private _lessonRepo: ILessonRepository,
    private _moduleRepo: IModuleRepository,
    private _courseRepo: ICourseRepository
  ) {}

  /**
   * Executes the lesson deletion logic.
   * Validates the lesson exists, the module exists, and the instructor owns the course before deleting the lesson.
   * @param lessonId - The ID of the lesson to delete.
   * @param instructorId - The ID of the instructor attempting the deletion.
   * @throws HttpError with appropriate status code if validation fails.
   */
  async execute(lessonId: string, instructorId: string): Promise<void> {
    // Find the lesson to ensure it exists
    const lesson = await this._lessonRepo.findById(lessonId);
    if (!lesson) {
      throw new HttpError(ERROR_MESSAGES.LESSON_NOT_FOUND, HttpStatusCode.BAD_REQUEST);
    }

    // Find the associated module to ensure it exists
    const module = await this._moduleRepo.findById(lesson.moduleId.toString());
    if (!module) {
      throw new HttpError(ERROR_MESSAGES.MODULE_NOT_FOUND, HttpStatusCode.BAD_REQUEST);
    }

    // Find the associated course and verify instructor ownership
    const course = await this._courseRepo.findById(module.courseId);
    if (!course || course.instructorId !== instructorId) {
      throw new HttpError(ERROR_MESSAGES.UNAUTHORIZED_DELETE_LESSON, HttpStatusCode.FORBIDDEN);
    }

    // Delete the lesson
    await this._lessonRepo.deleteById(lessonId);
  }
}
