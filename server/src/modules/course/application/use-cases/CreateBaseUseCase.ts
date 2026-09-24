import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';
import { Course } from '../../domain/entities/Course';
import { ICreateBaseUseCase } from '../interfaces/ICreateBaseUseCase';
import { CourseMapper } from '../mappers/CourseMapper';
import { CourseResponseDto } from '../dtos/CourseResponseDto';
import { CreateBaseValidationType } from '../dtos/CourseDetailsDtos';

/** Executes the business logic for create base. */
export class CreateBaseUseCase implements ICreateBaseUseCase {
  constructor(private _courseRepo: ICourseRepository) {}

  /**
   * Execute for the CreateBase entity.
   *
   * @param validatedData - The unique identifier for the validatedData.
   * @param instructorId - The unique identifier for the instructor.
   * @returns The standardized HTTP response.
   */
  async execute(
    validatedData: CreateBaseValidationType,
    instructorId: string,
  ): Promise<CourseResponseDto> {
    const dto = CourseMapper.toCreateDto(validatedData, instructorId);
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
