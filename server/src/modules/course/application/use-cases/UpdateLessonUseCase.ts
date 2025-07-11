import { ILessonRepository } from "../../domain/IRepositories/ILessonRepository";
import { IModuleRepository } from "../../domain/IRepositories/IModuleRepository";
import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";

import { Lesson } from "../../domain/entities/Lession";

export class UpdateLessonUseCase {
  constructor(
    private lessonRepo: ILessonRepository,
    private moduleRepo: IModuleRepository,
    private courseRepo: ICourseRepository
  ) {}

  async execute(lessonId: string, instructorId: string, data: {
    title?: string;
    contentType?: "video" | "pdf";
    contentUrl?: string;
    order?: number;
    isFreePreview?: boolean;
    isPublished?: boolean;
  }): Promise<void> {
    const lesson = await this.lessonRepo.findById(lessonId);
    if (!lesson) throw new Error("Lesson not found");

    const module = await this.moduleRepo.findById(lesson.moduleId);
    if (!module) throw new Error("Module not found");

    const course = await this.courseRepo.findById(module.courseId);
    if (!course || course.instructorId !== instructorId) {
      throw new Error("Unauthorized to update this lesson");
    }

    await this.lessonRepo.updateById(lessonId, data);
  }
}
