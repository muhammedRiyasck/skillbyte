import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";
import { CreateCourseDTO } from "../dtos/CreateBaseDTO";
import { Course } from "../../domain/entities/Course";
import DurationConverter from "../../../../shared/utils/DurationConverter";
import { ICreateBaseUseCase } from "../interfaces/ICreateBaseUseCase";

/**
 * Use case for creating a new course.
 * Handles the business logic for course creation, including duration conversion and tag parsing.
 */
export class CreateBaseUseCase implements ICreateBaseUseCase {
  /**
   * Constructs a new CreateBaseUseCase instance.
   * @param repo - The repository for course data operations.
   */
  constructor(private repo: ICourseRepository) {}

  /**
   * Executes the course creation logic.
   * Converts the duration, parses tags, creates a new Course entity, and saves it.
   * @param dto - The data transfer object containing course creation details.
   * @returns A promise that resolves to the created Course entity.
   */
  async execute(dto: CreateCourseDTO): Promise<Course> {
    const calculatedDate = DurationConverter(dto.duration);
    const tagsArray = dto.tags;
    console.log(dto.category,'category')
    const course = new Course(
      dto.instructorId,
      dto.thumbnailUrl,
      dto.title,
      dto.subText,
      dto.category,
      dto.courseLevel,
      dto.language,
      dto.price,
      dto.features,
      dto.description,
      calculatedDate,
      tagsArray,
    );
    return await this.repo.save(course);
  }
}
