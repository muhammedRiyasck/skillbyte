import { CreateLessonDto } from '../dtos/LessonDtos';
import { Lesson } from '../../domain/entities/Lesson';
import { ILessonDoc } from '../../infrastructure/models/LessonModel';
import { ContentType } from '../../../../shared/enums/ContentType';

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

  static toResponse(lesson: Lesson) {
    return {
      id: lesson.lessonId,
      moduleId: lesson.moduleId,
      title: lesson.title,
      description: lesson.description,
      contentType: lesson.contentType,
      fileName: lesson.fileName,
      order: lesson.order,
      duration: lesson.duration,
      resources: lesson.resources,
      isFreePreview: lesson.isFreePreview,
      isPublished: lesson.isPublished,
      isBlocked: lesson.isBlocked,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    };
  }

  static toUpdateEntity(dto: Record<string, unknown>) {
    return dto;
  }

  static toEntity(doc: ILessonDoc): Lesson {
    return new Lesson(
      doc.moduleId.toString(),
      doc.title,
      doc.description,
      doc.contentType as ContentType,
      doc.fileName,
      doc.order,
      doc.duration,
      doc.resources,
      doc.isFreePreview,
      doc.isPublished,
      doc.isBlocked,
      doc._id.toString(),
      doc.createdAt,
      doc.updatedAt,
    );
  }
}
