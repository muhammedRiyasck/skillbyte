
import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";

export class UpdateCourseStatusUseCase {
  constructor(private courseRepo: ICourseRepository) {}

  async execute(courseId: string, instructorId: string, status: "published" | "unpublished"): Promise<void> {
    const course = await this.courseRepo.findById(courseId);
    if (!course) throw new Error("Course not found");

    if (course.instructorId !== instructorId) {
      throw new Error("Unauthorized");
    }

    await this.courseRepo.updateStatus(courseId, status);
  }
}
