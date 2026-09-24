import { ILessonRepository } from '../../../course/domain/IRepositories/ILessonRepository';
import { IReportActionStrategy } from './IReportActionStrategy';

/** Handles lesson report action strategy functionality. */
export class LessonReportActionStrategy implements IReportActionStrategy {
  readonly targetType = 'lesson';

  constructor(private lessonRepository: ILessonRepository) {}

  /**
   * Execute action for the LessonReportActionStrategy entity.
   *
   * @param targetId - The unique identifier for the target.
   */
  async executeAction(targetId: string): Promise<void> {
    await this.lessonRepository.updateLessonById(targetId, {
      isBlocked: true,
    });
  }
}
