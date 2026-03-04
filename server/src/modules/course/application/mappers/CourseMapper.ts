import {
  CreateBaseSchema,
  UpdateBaseSchema,
  CourseResponseDto,
} from '../dtos/CourseDetailsDtos';
import { z } from 'zod';
import { Course } from '../../domain/entities/Course';
import { ModuleMapper } from './ModuleMapper';

export type CreateBaseDto = z.infer<typeof CreateBaseSchema>;
export type UpdateBaseDto = z.infer<typeof UpdateBaseSchema>;

export class CourseMapper {
  static toCreateBaseEntity(
    dto: CreateBaseDto,
    instructorId: string,
    thumbnailUrl?: string,
  ) {
    return {
      instructorId,
      thumbnailUrl: thumbnailUrl || null,
      title: dto.title,
      subText: dto.subText || '',
      category: dto.customCategory ? dto.customCategory : dto.category || '',
      courseLevel: dto.courseLevel || '',
      language: dto.language || '',
      price: dto.price || 0,
      features: dto.features || [],
      description: dto.description || '',
      duration: dto.access || '',
      tags: dto.tags || [],
      status: 'draft' as const,
    };
  }

  static toUpdateBaseEntity(data: UpdateBaseDto) {
    const { access, customCategory, category, thumbnail, ...rest } = data;

    return {
      ...rest,
      duration: access,
      category: customCategory || category,
      thumbnailUrl: thumbnail,
    };
  }

  static toResponseDto(course: Course): CourseResponseDto {
    return {
      id: course.courseId,
      instructorId: course.instructorId,
      thumbnailUrl: course.thumbnailUrl,
      title: course.title,
      subText: course.subText,
      category: course.category,
      courseLevel: course.courseLevel,
      language: course.language,
      price: course.price,
      features: course.features,
      description: course.description,
      duration: course.duration,
      tags: course.tags,
      status: course.status,
      isBlocked: course.isBlocked,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }

  static toDetailsResponse(
    course: Course & { instructor?: unknown },
  ): CourseResponseDto & { modules?: unknown[]; instructor?: unknown } {
    const response = this.toResponseDto(course) as CourseResponseDto & {
      modules?: unknown[];
      instructor?: unknown;
    };
    if (course.modules) {
      response.modules = course.modules.map((mod) =>
        ModuleMapper.toResponse(mod),
      );
    }
    if (course.instructor) {
      response.instructor = course.instructor;
    }
    return response;
  }
}
