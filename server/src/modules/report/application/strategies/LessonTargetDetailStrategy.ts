import { ILessonRepository } from '../../../course/domain/IRepositories/ILessonRepository';
import { ITargetDetailStrategy, TargetDetails } from './ITargetDetailStrategy';

export class LessonTargetDetailStrategy implements ITargetDetailStrategy {
  readonly targetType = 'lesson';

  constructor(private lessonRepository: ILessonRepository) {}

  async fetchDetails(targetId: string): Promise<TargetDetails | null> {
    const lesson = await this.lessonRepository.findById(targetId);
    if (!lesson) return null;
    return { title: lesson.title };
  }
}
