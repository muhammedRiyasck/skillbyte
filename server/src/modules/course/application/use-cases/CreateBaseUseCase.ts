import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";
import { CreateCourseDTO } from "../dtos/CreateBaseDTO";
import { Course } from "../../domain/entities/Course";
import DurationConverter from "../../../../shared/utils/DurationConverter";


export class CreateBaseUseCase {
  constructor(private repo: ICourseRepository) {}

  async execute(dto: CreateCourseDTO): Promise<Course> {
    const calcuatedDate = DurationConverter(dto.duration)
    const tagsArray = dto.tags.split(' ')

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
      calcuatedDate,
      tagsArray,
    );
    return await this.repo.save(course);
  }

 
}
