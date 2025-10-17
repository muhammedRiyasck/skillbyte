import { Module } from '../../domain/entities/Module';
import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';
import { IModuleRepository } from '../../domain/IRepositories/IModuleRepository';
import { IUpdateModuleUseCase } from '../interfaces/UpdateModuleUseCase ';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

/**
 * Use case for updating module information.
 * Handles the business logic for updating module details, including validation of ownership through course.
 */
export class UpdateModuleUseCase implements IUpdateModuleUseCase {
  /**
   * Constructs a new UpdateModuleUseCase instance.
   * @param moduleRepo - The repository for module data operations.
   * @param courseRepo - The repository for course data operations.
   */
  constructor(
    private moduleRepo: IModuleRepository,
    private courseRepo: ICourseRepository
  ) {}

  /**
   * Executes the module update logic.
   * Validates the module exists and the instructor owns the course, then updates the module.
   * @param moduleId - The ID of the module to update.
   * @param instructorId - The ID of the instructor making the update.
   * @param updates - The partial module data to update.
   * @returns A promise that resolves when the update is complete.
   * @throws HttpError with appropriate status code if validation fails or access is denied.
   */
  async execute(
    moduleId: string,
    instructorId: string,
    updates: Partial<Omit<Module, 'createdAt' | 'updatedAt' | 'courseId'>>
  ): Promise<void> {
    // Find the module to ensure it exists
    const module = await this.moduleRepo.findById(moduleId);
    if (!module) {
      throw new HttpError(ERROR_MESSAGES.MODULE_NOT_FOUND, HttpStatusCode.BAD_REQUEST);
    }

    // Find the course and check if the instructor owns it
    const course = await this.courseRepo.findById(module.courseId);
    if (!course || course.instructorId !== instructorId) {
      throw new HttpError(ERROR_MESSAGES.UNAUTHORIZED_UPDATE_MODULE, HttpStatusCode.FORBIDDEN);
    }

    // Update the module with the provided data
    await this.moduleRepo.updateModuleById(moduleId, updates);
  }
}
