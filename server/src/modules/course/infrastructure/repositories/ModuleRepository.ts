import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { Module } from '../../domain/entities/Module';
import { IModuleRepository } from '../../domain/IRepositories/IModuleRepository';
import { ModuleModel, IModuleDoc } from '../models/ModuleModel';
import { ModuleMapper } from '../mappers/ModuleMapper';

export class ModuleRepository
  extends BaseRepository<Module, IModuleDoc>
  implements IModuleRepository
{
  constructor() {
    super(ModuleModel);
  }

  toEntity(doc: IModuleDoc): Module {
    return ModuleMapper.toEntity(doc);
  }

  async findModulesByCourseId(courseId: string): Promise<Module[]> {
    const docs = await this.model.find({ courseId }).sort({ order: 1 });
    return docs.map((doc) => this.toEntity(doc));
  }

  async updateModuleById(
    moduleId: string,
    updates: Partial<Module>,
  ): Promise<void> {
    await this.model.findByIdAndUpdate(moduleId, updates, { new: true });
  }

  async deleteManyByCourseId(courseId: string): Promise<void> {
    await this.model.deleteMany({ courseId });
  }
}
