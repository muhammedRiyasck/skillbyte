import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";
import { ILessonRepository } from "../../domain/IRepositories/ILessonRepository";
import { IModuleRepository } from "../../domain/IRepositories/IModuleRepository";
import { IDeleteCourseUseCase } from "../interfaces/IDeleteCourseUseCase";
import { ERROR_MESSAGES } from "../../../../shared/constants/messages";
import { HttpError } from "../../../../shared/types/HttpError";
import { HttpStatusCode } from "../../../../shared/enums/HttpStatusCodes";

/**
 * Use case for deleting a course.
 * Handles the business logic for course deletion, including cascading deletes of modules and lessons.
 * Ensures only the course instructor can delete the course.
 */
export class DeleteCourseUseCase implements IDeleteCourseUseCase {
  /**
   * Constructs a new DeleteCourseUseCase instance.
   * @param courseRepo - The repository for course data operations.
   * @param moduleRepo - The repository for module data operations.
   * @param lessonRepo - The repository for lesson data operations.
   */
  constructor(
    private _courseRepo: ICourseRepository,
    private _moduleRepo: IModuleRepository,
    private _lessonRepo: ILessonRepository
  ) {}

  /**
   * Executes the course deletion logic.
   * Validates the course exists and the instructor owns it, then deletes lessons, modules, and the course in cascade.
   * @param courseId - The ID of the course to delete.
   * @param instructorId - The ID of the instructor attempting the deletion.
   * @throws HttpError with appropriate status code if validation fails.
   */
  async execute(courseId: string, instructorId: string): Promise<void> {
    // Find the course to ensure it exists
    const course = await this._courseRepo.findById(courseId);
    if (!course) {
      throw new HttpError(ERROR_MESSAGES.COURSE_NOT_FOUND, HttpStatusCode.BAD_REQUEST);
    }

    // Verify the instructor owns the course
    if (course.instructorId !== instructorId) {
      throw new HttpError(ERROR_MESSAGES.UNAUTHORIZED, HttpStatusCode.FORBIDDEN);
    }

    // Retrieve all modules associated with the course
    const modules = await this._moduleRepo.findModulesByCourseId(courseId);
    const moduleIds = modules.map(m => m.moduleId).filter((id): id is string => typeof id === "string");

    // Delete all lessons under the modules to avoid orphaned data
    await this._lessonRepo.deleteManyByModuleIds(moduleIds);

    // Delete all modules associated with the course
    await this._moduleRepo.deleteManyByCourseId(courseId);

    // Finally, delete the course itself
    await this._courseRepo.deleteById(courseId);
  }
}
