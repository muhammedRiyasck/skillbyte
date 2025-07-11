import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";

export class GetAllCoursesForAdminUseCase {
  constructor(private courseRepo: ICourseRepository) {}

  async execute(filters: {
    instructorId?: string;
    status?: string;
    category?: string;
    search?: string;
  }) {
    return await this.courseRepo.findAllForAdmin(filters);
  }
}
