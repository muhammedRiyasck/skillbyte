import { ICourseRepository } from '../../../course/domain/IRepositories/ICourseRepository';
import { IReportActionStrategy } from './IReportActionStrategy';

export class CourseReportActionStrategy implements IReportActionStrategy {
  readonly targetType = 'course';

  constructor(private courseRepository: ICourseRepository) {}

  async executeAction(targetId: string): Promise<void> {
    await this.courseRepository.blockCourse(targetId, true);
  }
}
