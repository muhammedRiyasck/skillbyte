import { IBaseRepository } from '../../../../shared/repositories/IBaseRepository';
import { Module } from '../../domain/entities/Module';

export interface IModuleRepository extends IBaseRepository<Module> {
  save(data: {
    courseId: string;
    title: string;
    description: string;
    order: number;
  }): Promise<Module>;
  findModulesByCourseId(courseId: string): Promise<Module[]>;
  updateModuleById(moduleId: string, updates: Partial<Module>): Promise<void>;
  deleteManyByCourseId(courseId: string): Promise<void>;
}
