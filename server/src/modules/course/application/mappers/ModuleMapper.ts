import { CreateModuleDto, ModuleResponseDto } from '../dtos/ModuleDtos';
import { LessonMapper } from './LessonMapper';
import { Module } from '../../domain/entities/Module';

/** Handles module mapper functionality. */
export class ModuleMapper {
  /**
   * To create entity for the ModuleMapper entity.
   *
   * @param dto - The data transfer object containing request details.
   */
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

  /**
   * To response for the ModuleMapper entity.
   *
   * @param module - The module information.
   * @returns The standardized HTTP response.
   */
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

  /**
   * To update entity for the ModuleMapper entity.
   *
   * @param dto - The data transfer object containing request details.
   */
  static toUpdateEntity(dto: Record<string, unknown>) {
    return dto;
  }
}
