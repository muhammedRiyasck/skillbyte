import { CreateBaseSchema, UpdateBaseSchema } from '../dtos/CourseDetailsDtos';
import { z } from 'zod';

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
}
