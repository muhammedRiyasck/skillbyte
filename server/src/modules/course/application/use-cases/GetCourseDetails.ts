// application/use-cases/GetCourseDetailsUseCase.ts

import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository'; 
import { IModuleRepository } from '../../domain/IRepositories/IModuleRepository';
import { ILessonRepository } from '../../domain/IRepositories/ILessonRepository';

export class GetCourseDetailsUseCase {
  constructor(
    private courseRepo: ICourseRepository,
    private moduleRepo: IModuleRepository,
    private lessonRepo: ILessonRepository
  ) {}

  async execute(courseId: string,role:string) {
    const course = await this.courseRepo.findById(courseId);
    
    if (!course) throw new Error("Course not found");

    if (role === 'student'&&course.status !== "published") {
      throw new Error("This course maybe unpublished or not available");
    }

    const modules = await this.moduleRepo.findModulesByCourseId(courseId);

    const fullModules = await Promise.all(
      modules.map(async (mod) => {
        const lessons = await this.lessonRepo.findByModuleId(mod.id!);
        return {
          id: mod.id,
          title: mod.title,
          description: mod.description,
          order: mod.order,
          lessons: lessons.map(les => ({
            id: les.id,
            title: les.title,
            contentType: les.contentType,
            contentUrl: les.contentUrl,
            order: les.order
          }))
        };
      })
    );

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      thumbnailUrl: course.thumbnailUrl,
      category: course.category,
      tags: course.tags,
      isPublished: course.status,
      modules: fullModules
    };
  }
}
