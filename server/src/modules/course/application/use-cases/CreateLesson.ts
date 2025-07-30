import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";
import { ILessonRepository } from "../../domain/IRepositories/ILessonRepository";
import { IModuleRepository } from "../../domain/IRepositories/IModuleRepository";
import { Lesson } from "../../domain/entities/Lession";

export class CreateLessonUseCase {
  constructor(
    private courseRepo: ICourseRepository, // Assuming courseRepo is used to verify ownership
    private moduleRepo: IModuleRepository,
    private lessonRepo: ILessonRepository,
  ) {}

  async execute(dto: {
    moduleId: string;
    instructorId: string;
    title: string;
    contentType: "video" | "pdf";
    contentUrl: string;
    order: number;
    isFreePreview?: boolean;
    isPublished?: boolean;
  }): Promise<void> {
      
          // verify instructor owns the course/module
    const module = await this.moduleRepo.findById(dto.moduleId);
    if (!module) throw new Error("Module not found");
    const course = await this.courseRepo.findById(module?.courseId); 
    if (!course) throw new Error("Course not found");
    if (course.instructorId !== dto.instructorId) {
      throw new Error("Unauthorized to add lesson to this module");
    }
    const lesson = new Lesson(
      dto.moduleId,
      dto.title,
      dto.contentType,
      dto.contentUrl,
      dto.order,
      dto.isFreePreview || false,
      dto.isPublished || false
    );

    await this.lessonRepo.create(lesson);
  }
}
