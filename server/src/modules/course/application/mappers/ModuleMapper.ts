import { CreateModuleDto } from '../dtos/ModuleDtos';

export class ModuleMapper {
  static toCreateEntity(dto: CreateModuleDto) {
    return {
      courseId: dto.courseId,
      moduleId: dto.moduleId,
      title: dto.title,
      description: dto.description || '',
      order: dto.order,
      lessons: dto.lessons || [],
    };
  }

  static toUpdateEntity(dto: Record<string, unknown>) {
    return dto;
  }
}
