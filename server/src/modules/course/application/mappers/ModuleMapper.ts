import { z } from 'zod';
import { CreateModuleSchema } from '../dtos/ModuleDtos';
import { LessonMapper } from './LessonMapper';
import { Module } from '../../domain/entities/Module';
import { IModuleDoc } from '../../infrastructure/models/ModuleModel';

export class ModuleMapper {
  static toCreateEntity(dto: z.infer<typeof CreateModuleSchema>) {
    return {
      courseId: dto.courseId || dto.id || '',
      moduleId: dto.moduleId,
      title: dto.title,
      description: dto.description || '',
      order: dto.order,
      lessons: dto.lessons || [],
    };
  }

  static toResponse(module: Module) {
    return {
      id: module.moduleId,
      courseId: module.courseId,
      title: module.title,
      description: module.description,
      order: module.order,
      lessons: module.lessons
        ? module.lessons.map((l) => LessonMapper.toResponse(l))
        : [],
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
    };
  }

  static toUpdateEntity(dto: Record<string, unknown>) {
    return dto;
  }

  static toEntity(doc: IModuleDoc): Module {
    return new Module(
      doc.courseId.toString(),
      doc.title,
      doc.description,
      doc.order,
      doc.createdAt,
      doc.updatedAt,
      doc._id.toString(),
    );
  }
}
