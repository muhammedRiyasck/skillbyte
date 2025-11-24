import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";
import { ILessonRepository } from "../../domain/IRepositories/ILessonRepository";
import { IModuleRepository } from "../../domain/IRepositories/IModuleRepository";
import { IDeleteModuleUseCase } from "../interfaces/IDeleteModuleUseCase";
import { ERROR_MESSAGES } from "../../../../shared/constants/messages";
import { HttpError } from "../../../../shared/types/HttpError";
import { HttpStatusCode } from "../../../../shared/enums/HttpStatusCodes";

/**
 * Use case for deleting a module.
 * Handles the business logic for module deletion, including cascading deletes of associated lessons.
 * Ensures only the course instructor can delete the module.
 */
export class DeleteModuleUseCase implements IDeleteModuleUseCase {
  /**
   * Constructs a new DeleteModuleUseCase instance.
   * @param moduleRepo - The repository for module data operations.
   * @param lessonRepo - The repository for lesson data operations.
   * @param courseRepo - The repository for course data operations.
   */
  constructor(
    private _moduleRepo: IModuleRepository,
    private _lessonRepo: ILessonRepository,
    private _courseRepo: ICourseRepository
  ) {}

  /**
   * Executes the module deletion logic.
   * Validates the module exists and the instructor owns the associated course, then deletes lessons and the module in cascade.
   * @param moduleId - The ID of the module to delete.
   * @param instructorId - The ID of the instructor attempting the deletion.
   * @throws HttpError with appropriate status code if validation fails.
   */
  async execute(moduleId: string, instructorId: string): Promise<void> {
    // Find the module to ensure it exists
    const module = await this._moduleRepo.findById(moduleId);
    if (!module) {
      throw new HttpError(ERROR_MESSAGES.MODULE_NOT_FOUND, HttpStatusCode.BAD_REQUEST);
    }

    // Find the associated course and verify instructor ownership
    const course = await this._courseRepo.findById(module.courseId);
    if (!course || course.instructorId !== instructorId) {
      throw new HttpError(ERROR_MESSAGES.UNAUTHORIZED_DELETE_MODULE, HttpStatusCode.FORBIDDEN);
    }

    // Delete all lessons associated with the module first to avoid orphaned data
    await this._lessonRepo.deleteManyByModuleId(moduleId);

    // Then delete the module itself
    await this._moduleRepo.deleteById(moduleId);
  }
}
