import { CreateBaseSchema } from '../dtos/CourseDetailsDtos';
import { z } from 'zod';

export type CreateBaseDto = z.infer<typeof CreateBaseSchema>;


export class CourseMapper {
  static toCreateBaseEntity(dto: CreateBaseDto, instructorId: string, thumbnailUrl?: string) {
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
          status: 'draft' as 'draft',
      }
  }

  static toUpdateBaseEntity(data: any) {
     
       return {
            ...data,
            duration: data.access,
            category: data.customCategory ? data.customCategory : data.category,
       }
  }
}
