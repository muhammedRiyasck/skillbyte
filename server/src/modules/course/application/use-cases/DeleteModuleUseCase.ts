import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";
import { ILessonRepository } from "../../domain/IRepositories/ILessonRepository";
import { IModuleRepository } from "../../domain/IRepositories/IModuleRepository";


export class DeleteModuleUseCase {
  constructor(
    private moduleRepo: IModuleRepository,
    private lessonRepo: ILessonRepository,
    private courseRepo: ICourseRepository
  ) {}

  async execute(moduleId: string, instructorId: string): Promise<void> {
    const module = await this.moduleRepo.findById(moduleId);
    if (!module) throw new Error("Module not found");

    const course = await this.courseRepo.findById(module.courseId);
    if (!course || course.instructorId !== instructorId) {
      throw new Error("Unauthorized to delete this module");
    }

    // Delete all lessons first
    await this.lessonRepo.deleteManyByModuleId(moduleId);

    // Then delete module
    await this.moduleRepo.deleteById(moduleId);
  }
}
