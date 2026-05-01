import {
  IGetAllReviewsAdminUseCase,
  AdminReviewDto,
  AdminReviewListResult,
} from '../interfaces/IGetAllReviewsAdminUseCase';
import {
  IReviewRepository,
  AdminReviewFilters,
} from '../../domain/IRepositories/IReviewRepository';

export class GetAllReviewsAdminUseCase implements IGetAllReviewsAdminUseCase {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute(
    filters: AdminReviewFilters,
    page: number,
    limit: number,
  ): Promise<AdminReviewListResult> {
    const [reviews, total] = await Promise.all([
      this.reviewRepository.findAllForAdmin(filters, page, limit),
      this.reviewRepository.countAllForAdmin(filters),
    ]);

    const dtos: AdminReviewDto[] = reviews.map((r) => ({
      reviewId: r.reviewId!,
      studentId: r.studentId,
      studentName: r.studentInfo?.name ?? 'Unknown',
      studentProfilePic: r.studentInfo?.profileImageUrl,
      targetType: r.targetType,
      targetId: r.targetId,
      instructorId: r.instructorId,
      rating: r.rating,
      comment: r.comment,
      helpfulCount: r.helpfulCount,
      isHidden: r.isHidden,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return {
      reviews: dtos,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
