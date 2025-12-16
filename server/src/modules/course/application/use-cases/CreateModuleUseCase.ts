import mongoose from 'mongoose';
import { Module } from '../../domain/entities/Module';
import { IModuleRepository } from '../../domain/IRepositories/IModuleRepository';
import { ICreateModuleUseCase } from '../interfaces/ICreateModuleUseCase';

/**
 * Use case for creating a new module.
 * Handles the business logic for module creation, including validation of module ID and avoiding duplicates.
 */
export class CreateModuleUseCase implements ICreateModuleUseCase {
  /**
   * Constructs a new CreateModuleUseCase instance.
   * @param _moduleRepo - The repository for module data operations.
   */
  constructor(private _moduleRepo: IModuleRepository) {}

  /**
   * Executes the module creation logic.
   * Validates if the moduleId is a valid ObjectId. If not, creates a new module.
   * If it is a valid ObjectId, checks if the module exists; if not, creates it to avoid redundancy when adding lessons.
   * @param dto - The data transfer object containing module creation details.
   * @returns A promise that resolves to the created Module entity or null if no module was created.
   */
  async execute(dto: any): Promise<Module | null> {
    // Check if the provided moduleId is a valid MongoDB ObjectId
    const isObjectId =
      mongoose.Types.ObjectId.isValid(dto.moduleId) &&
      String(new mongoose.Types.ObjectId(dto.moduleId)) === dto.moduleId;

    // If moduleId is not a valid ObjectId, create a new module
    if (!isObjectId) {
      return await this._moduleRepo.save({
        courseId: dto.courseId,
        title: dto.title,
        description: dto.description,
        order: dto.order,
      });
    } else {
      // If moduleId is valid, check if the module already exists
      const isModuleExist = await this._moduleRepo.findById(dto.moduleId);

      // Create the module only if it does not exist, to prevent duplicates when adding lessons
      if (!isModuleExist) {
        return await this._moduleRepo.save({
          courseId: dto.courseId,
          title: dto.title,
          description: dto.description,
          order: dto.order,
        });
      }
    }

    // Return null if no module was created (e.g., module already exists)
    return null;
  }
}
