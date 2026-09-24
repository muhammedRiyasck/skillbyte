import { ICourseRepository } from '../../../course/domain/IRepositories/ICourseRepository';
import { IReportActionStrategy } from './IReportActionStrategy';

/** Handles course report action strategy functionality. */
export class CourseReportActionStrategy implements IReportActionStrategy {
  readonly targetType = 'course';

  constructor(private courseRepository: ICourseRepository) {}

  /**
   * Execute action for the CourseReportActionStrategy entity.
   *
   * @param targetId - The unique identifier for the target.
   */
  async executeAction(targetId: string): Promise<void> {
    await this.courseRepository.blockCourse(targetId, true);
  }
}
