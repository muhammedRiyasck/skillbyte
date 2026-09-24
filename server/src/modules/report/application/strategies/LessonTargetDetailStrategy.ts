import { ILessonRepository } from '../../../course/domain/IRepositories/ILessonRepository';
import { ITargetDetailStrategy, TargetDetails } from './ITargetDetailStrategy';

/** Handles lesson target detail strategy functionality. */
export class LessonTargetDetailStrategy implements ITargetDetailStrategy {
  readonly targetType = 'lesson';

  constructor(private lessonRepository: ILessonRepository) {}

  /**
   * Fetch details for the LessonTargetDetailStrategy entity.
   *
   * @param targetId - The unique identifier for the target.
   * @returns The result of the operation.
   */
  async fetchDetails(targetId: string): Promise<TargetDetails | null> {
    const lesson = await this.lessonRepository.findById(targetId);
    if (!lesson) return null;
    return { title: lesson.title };
  }
}
