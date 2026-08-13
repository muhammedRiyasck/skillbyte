import { Course } from '../../domain/entities/Course';
import {
  CourseResponseDto,
  PaginatedCourseResponseDto,
} from '../dtos/CourseResponseDto';
import { ModuleMapper } from './ModuleMapper';
import {
  CreateBaseValidationType,
  UpdateBaseValidationType,
} from '../dtos/CourseDetailsDtos';
import { CreateCourseDto, UpdateCourseDto } from '../dtos/CourseDto';

export class CourseMapper {
  /** Maps the validated Zod create payload + instructor context → a plain DTO for the use case */
  static toCreateDto(
    dto: CreateBaseValidationType,
    instructorId: string,
  ): CreateCourseDto {
    return {
      instructorId,
      thumbnailUrl: dto.thumbnail || null,
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
    };
  }

  static toUpdateDto(data: UpdateBaseValidationType): UpdateCourseDto {
    const { access, customCategory, category, thumbnail, ...rest } = data;
    
    const updateDto: UpdateCourseDto = {
      ...rest,
    };
    
    if (access !== undefined) updateDto.duration = access;
    if (customCategory || category) updateDto.category = customCategory || category;
    if (thumbnail !== undefined) updateDto.thumbnailUrl = thumbnail;

    // Optional: strip any other undefined fields from rest
    Object.keys(updateDto).forEach((key) => {
      if (updateDto[key as keyof UpdateCourseDto] === undefined) {
        delete updateDto[key as keyof UpdateCourseDto];
      }
    });

    return updateDto;
  }

  /** Maps a domain Course entity → a response DTO (strips internal/infra fields) */
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
      averageRating: course.averageRating,
      totalReviews: course.totalReviews,
      isQuizEnabled: course.isQuizEnabled,
    };
  }

  /** Maps a Course entity with optional includes → a full details response DTO */
  static toDetailsResponse(
    course: Course & { instructor?: unknown },
  ): CourseResponseDto {
    const response: CourseResponseDto = this.toResponseDto(course);
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

  /** Maps a paginated course list to PaginatedCourseResponseDto */
  static toPaginatedResponse(courses: {
    data: Course[];
    meta: PaginatedCourseResponseDto['meta'];
  }): PaginatedCourseResponseDto {
    return {
      data: courses.data.map((c) => this.toResponseDto(c)),
      meta: courses.meta,
    };
  }
}
