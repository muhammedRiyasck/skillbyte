import logger from '../../../../shared/utils/Logger';
import { IRefreshTopInstructorsUseCase } from '../interfaces/IRefreshTopInstructorsUseCase';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';
import {
  ITopInstructorRepository,
  ITopInstructorData,
} from '../../domain/IRepositories/ITopInstructorRepository';

/** Executes the business logic for refresh top instructors. */
export class RefreshTopInstructorsUseCase
  implements IRefreshTopInstructorsUseCase
{
  constructor(
    private instructorRepository: IInstructorRepository,
    private topInstructorRepository: ITopInstructorRepository,
  ) {}

  /** Execute for the RefreshTopInstructors entity. */
  public async execute(): Promise<void> {
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
