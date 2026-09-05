import { ILessonRepository } from '../../../course/domain/IRepositories/ILessonRepository';
import { IReportActionStrategy } from './IReportActionStrategy';

export class LessonReportActionStrategy implements IReportActionStrategy {
  readonly targetType = 'lesson';

  constructor(private lessonRepository: ILessonRepository) {}

  async executeAction(targetId: string): Promise<void> {
    await this.lessonRepository.updateLessonById(targetId, {
      isBlocked: true,
    });
  }
}
