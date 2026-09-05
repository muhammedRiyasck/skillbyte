import { ICourseRepository } from '../../../course/domain/IRepositories/ICourseRepository';
import { ITargetDetailStrategy, TargetDetails } from './ITargetDetailStrategy';

export class CourseTargetDetailStrategy implements ITargetDetailStrategy {
  readonly targetType = 'course';

  constructor(private courseRepository: ICourseRepository) {}

  async fetchDetails(targetId: string): Promise<TargetDetails | null> {
    const course = await this.courseRepository.findById(targetId);
    if (!course) return null;
    return { title: course.title };
  }
}
