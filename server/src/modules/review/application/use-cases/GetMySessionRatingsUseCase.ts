import { IReviewRepository } from '../../domain/IRepositories/IReviewRepository';
import { IGetMySessionRatingsUseCase } from '../interfaces/IGetMySessionRatingsUseCase';

export class GetMySessionRatingsUseCase implements IGetMySessionRatingsUseCase {
  constructor(private reviewRepo: IReviewRepository) {}

  async execute(studentId: string): Promise<Record<string, number>> {
    return this.reviewRepo.findStudentSessionRatings(studentId);
  }
}
