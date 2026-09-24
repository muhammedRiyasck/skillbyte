import { ICourseRepository } from '../../../course/domain/IRepositories/ICourseRepository';
import { ITargetDetailStrategy, TargetDetails } from './ITargetDetailStrategy';

/** Handles course target detail strategy functionality. */
export class CourseTargetDetailStrategy implements ITargetDetailStrategy {
  readonly targetType = 'course';

  constructor(private courseRepository: ICourseRepository) {}

  /**
   * Fetch details for the CourseTargetDetailStrategy entity.
   *
   * @param targetId - The unique identifier for the target.
   * @returns The result of the operation.
   */
  async fetchDetails(targetId: string): Promise<TargetDetails | null> {
    const course = await this.courseRepository.findById(targetId);
    if (!course) return null;
    return { title: course.title };
  }
}
