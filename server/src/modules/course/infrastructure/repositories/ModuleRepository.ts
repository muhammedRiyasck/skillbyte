import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { Module } from '../../domain/entities/Module';
import { IModuleRepository } from '../../domain/IRepositories/IModuleRepository';
import { ModuleModel, IModuleDoc } from '../models/ModuleModel';
import { ModuleMapper } from '../mappers/ModuleMapper';

/** Manages database operations for module. */
export class ModuleRepository
  extends BaseRepository<Module, IModuleDoc>
  implements IModuleRepository
{
  constructor() {
    super(ModuleModel);
  }

  /**
   * To entity for the Module entity.
   *
   * @param doc - The doc information.
   * @returns The result of the operation.
   */
  toEntity(doc: IModuleDoc): Module {
    return ModuleMapper.toEntity(doc);
  }

  /**
   * Find modules by course id for the Module entity.
   *
   * @param courseId - The unique identifier for the course.
   * @returns The result of the operation.
   */
  async findModulesByCourseId(courseId: string): Promise<Module[]> {
    const docs = await this.model.find({ courseId }).sort({ order: 1 });
    return docs.map((doc) => this.toEntity(doc));
  }

  /**
   * Update module by id for the Module entity.
   *
   * @param moduleId - The unique identifier for the module.
   * @param updates - The updates information.
   */
  async updateModuleById(
    moduleId: string,
    updates: Partial<Module>,
  ): Promise<void> {
    await this.model.findByIdAndUpdate(moduleId, updates, { new: true });
  }

  /**
   * Delete many by course id for the Module entity.
   *
   * @param courseId - The unique identifier for the course.
   */
  async deleteManyByCourseId(courseId: string): Promise<void> {
    await this.model.deleteMany({ courseId });
  }
}
