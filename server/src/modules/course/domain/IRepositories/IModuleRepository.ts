import { Module } from "../../domain/entities/Module";

export interface IModuleRepository {
  save(data: {
    courseId: string;
    title: string;
    description: string;
    order: number;
  }): Promise<Module>;
  findModulesByCourseId(courseId: string): Promise<Module[]>;
  findById(moduleId: string): Promise<Module | null>;
  updateModuleById(moduleId: string, updates: Partial<Module>): Promise<void>;
  deleteById(moduleId: string): Promise<void>;
  deleteManyByCourseId(courseId: string): Promise<void>;
}
