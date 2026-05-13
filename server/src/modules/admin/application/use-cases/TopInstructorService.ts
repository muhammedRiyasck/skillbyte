import logger from '../../../../shared/utils/Logger';
import { ITopInstructorUseCase } from '../interfaces/ITopInstructorUseCase';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';
import {
  ITopInstructorRepository,
  ITopInstructorData,
} from '../../domain/IRepositories/ITopInstructorRepository';

export class TopInstructorUseCase implements ITopInstructorUseCase {
  constructor(
    private instructorRepository: IInstructorRepository,
    private topInstructorRepository: ITopInstructorRepository,
  ) {}

  /**
   * Refreshes the top instructors capped collection by fetching the latest top 5
   * and inserting them. The capped collection will automatically drop the oldest 5.
   */
  public async refreshTopInstructors(): Promise<void> {
    try {
      const topInstructors =
        await this.instructorRepository.getTopEarningInstructors(5);

      if (topInstructors.length === 0) {
        return;
      }

      const instructorsData: ITopInstructorData[] = topInstructors.map(
        (instructor) => ({
          instructorId: instructor.instructorId!.toString(),
          name: instructor.name,
          profilePictureUrl: instructor.profilePictureUrl || null,
          totalEarnings: instructor.totalEarnings || 0,
          averageRating: instructor.averageRating || 0,
          totalReviews: instructor.totalReviews || 0,
        }),
      );

      await this.topInstructorRepository.replaceTopInstructors(instructorsData);

      logger.info('Top instructors capped collection refreshed');
    } catch (error) {
      logger.error('Error refreshing top instructors:', error);
    }
  }
}
