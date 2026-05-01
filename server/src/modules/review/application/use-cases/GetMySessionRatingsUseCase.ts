import { IReviewRepository } from '../../domain/IRepositories/IReviewRepository';
import { IGetMySessionRatingsUseCase } from '../interfaces/IGetMySessionRatingsUseCase';

export class GetMySessionRatingsUseCase implements IGetMySessionRatingsUseCase {
  constructor(private reviewRepo: IReviewRepository) {}

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
