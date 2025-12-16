import { CreateLessonDto } from '../dtos/LessonDtos';

export class LessonMapper {
  static toCreateEntity(dto: CreateLessonDto, instructorId: string) {
    return {
      moduleId: dto.moduleId,
      instructorId,
      title: dto.title,
      description: dto.description || '',
      contentType: dto.contentType as 'video' | 'pdf',
      fileName: dto.fileName,
      order: dto.order,
      duration: dto.duration || 0,
      resources: dto.resources || [],
      isFreePreview: dto.isFreePreview || false,
      isBlocked: false,
      isPublished: dto.isPublished ?? true,
    };
  }

  static toUpdateEntity(dto: Record<string, unknown>) {
    return dto;
  }
}
