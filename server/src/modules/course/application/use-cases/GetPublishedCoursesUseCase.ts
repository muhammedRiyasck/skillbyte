import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";

export class GetPublishedCoursesUseCase {
  constructor(private courseRepo: ICourseRepository) {}

  async execute(filters: {
    search?: string;
    category?: string;
    price?: "free" | "paid";
  }) {
    return await this.courseRepo.findPublishedCourses(filters);
  }
}
