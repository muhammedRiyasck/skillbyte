import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";
import { CreateCourseDTO } from "../dtos/CreateBaseDTO";
import { Course } from "../../domain/entities/Course";


export class CreateBaseUseCase {
  constructor(private repo: ICourseRepository) {}

  async execute(dto: CreateCourseDTO): Promise<Course> {
    const course = new Course(
      dto.instructorId,
      dto.title,
      dto.description,
      dto.thumbnailUrl,
      dto.price,
      dto.category,
      dto.tags,
    );
    return await this.repo.save(course);
  }

 
}
