import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";

export class GetInstructorCoursesUseCase {
  constructor(private courseRepo: ICourseRepository) {}

  async execute(instructorId: string) {
    return await this.courseRepo.findByInstructorId(instructorId);
  }
}
