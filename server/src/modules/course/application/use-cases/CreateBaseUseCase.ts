import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';
import { Course } from '../../domain/entities/Course';
import { ICreateBaseUseCase } from '../interfaces/ICreateBaseUseCase';
import { CourseMapper } from '../mappers/CourseMapper';
import { CreateCourseDto } from '../dtos/CourseDto';
import { CourseResponseDto } from '../dtos/CourseResponseDto';

/**
 * Use case for creating a new course.
 */
export class CreateBaseUseCase implements ICreateBaseUseCase {
  constructor(private _courseRepo: ICourseRepository) {}

  async execute(dto: CreateCourseDto): Promise<CourseResponseDto> {
    const course = new Course(
      dto.instructorId,
      dto.thumbnailUrl || null,
      dto.title,
      dto.subText,
      dto.category,
      dto.courseLevel,
      dto.language,
      dto.price,
      dto.features,
      dto.description,
      dto.duration,
      dto.tags,
    );
    const saved = await this._courseRepo.save(course);
    return CourseMapper.toResponseDto(saved);
  }
}
