import { CreateModuleDto, ModuleResponseDto } from '../dtos/ModuleDtos';
import { LessonMapper } from './LessonMapper';
import { Module } from '../../domain/entities/Module';

export class ModuleMapper {
  static toCreateEntity(dto: CreateModuleDto) {
    return {
      courseId: dto.courseId || dto.id || '',
      moduleId: dto.moduleId,
      title: dto.title,
      description: dto.description || '',
      order: dto.order,
      lessons: dto.lessons || [],
      instructorId: dto.instructorId,
    };
  }

  static toResponse(module: Module): ModuleResponseDto {
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
}
