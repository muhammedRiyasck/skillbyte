import { ILessonRepository } from "../../domain/IRepositories/ILessonRepository";
import { IModuleRepository } from "../../domain/IRepositories/IModuleRepository";

import {CreateModuleDTO} from "../dtos/CreateModuleDTO";

export class CreateModuleWithLessonsUseCase {
  constructor(
    private moduleRepo: IModuleRepository,
    private lessonRepo: ILessonRepository
  ) {}

  async execute(dto: CreateModuleDTO): Promise<void> {
    const module = await this.moduleRepo.save({
      courseId: dto.courseId,
      title: dto.title,
      description: dto.description,
      order: dto.order
    });

    for (const lesson of dto.lessons) {
      await this.lessonRepo.save({
        moduleId: module.id!,
        title: lesson.title,
        contentType: lesson.contentType,
        contentUrl: lesson.contentUrl,
        order: lesson.order,
        isFreePreview: lesson.isFreePreview || false,
        isPublished: lesson.isPublished || false     
      });
    }
  }
}
