import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";
import { ILessonRepository } from "../../domain/IRepositories/ILessonRepository";
import { IModuleRepository } from "../../domain/IRepositories/IModuleRepository";

export class DeleteCourseUseCase {
  constructor(
    private courseRepo: ICourseRepository,
    private moduleRepo: IModuleRepository,
    private lessonRepo: ILessonRepository
  ) {}

  async execute(courseId: string, instructorId: string): Promise<void> {
    const course = await this.courseRepo.findById(courseId);
    if (!course) throw new Error("Course not found");
    if (course.instructorId !== instructorId) throw new Error("Unauthorized");

    const modules = await this.moduleRepo.findModulesByCourseId(courseId);
    const moduleIds = modules.map(m => m.id).filter((id): id is string => typeof id === "string");

    // Delete all lessons under modules
    await this.lessonRepo.deleteManyByModuleIds(moduleIds);

    // Delete all modules
    await this.moduleRepo.deleteManyByCourseId(courseId);

    // Finally, delete the course
    await this.courseRepo.deleteById(courseId);
  }
}
