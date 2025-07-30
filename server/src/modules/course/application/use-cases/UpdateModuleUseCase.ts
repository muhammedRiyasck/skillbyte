import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";
import { IModuleRepository } from "../../domain/IRepositories/IModuleRepository";

export class UpdateModuleUseCase {
  constructor(
    private moduleRepo: IModuleRepository,
    private courseRepo: ICourseRepository
  ) {}

  async execute(moduleId: string, instructorId: string, updates: {
    title?: string;
    description?: string;
    order?: number;
  }): Promise<void> {
    const module = await this.moduleRepo.findById(moduleId);
    if (!module) throw new Error("Module not found");

    const course = await this.courseRepo.findById(module.courseId);
    if (!course || course.instructorId !== instructorId) {
      throw new Error("Unauthorized to update this module");
    }

    await this.moduleRepo.updateById(moduleId, updates);
  }
}
