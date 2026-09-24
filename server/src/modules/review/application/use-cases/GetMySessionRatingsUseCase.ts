import { IReviewRepository } from '../../domain/IRepositories/IReviewRepository';
import { IGetMySessionRatingsUseCase } from '../interfaces/IGetMySessionRatingsUseCase';

/** Executes the business logic for get my session ratings. */
export class GetMySessionRatingsUseCase implements IGetMySessionRatingsUseCase {
  constructor(private reviewRepo: IReviewRepository) {}

  /**
   * Execute for the GetMySessionRatings entity.
   *
   * @param studentId - The unique identifier for the student.
   * @returns The result of the operation.
   */
  async execute(studentId: string): Promise<
    Record<
      string,
      {
        rating: number;
        comment: string;
        instructorReply?: string;
        repliedAt?: Date;
      }
    >
  > {
    return this.reviewRepo.findStudentSessionRatings(studentId);
  }
}
