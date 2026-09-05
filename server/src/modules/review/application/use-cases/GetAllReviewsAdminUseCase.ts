import {
  IGetAllReviewsAdminUseCase,
  AdminReviewDto,
  AdminReviewListResult,
} from '../interfaces/IGetAllReviewsAdminUseCase';
import {
  IReviewRepository,
  AdminReviewFilters,
} from '../../domain/IRepositories/IReviewRepository';
import { ICourseRepository } from '../../../course/domain/IRepositories/ICourseRepository';
import { IMentorshipBookingRepository } from '../../../mentorship/domain/IRepositories/IMentorshipBookingRepository';

export class GetAllReviewsAdminUseCase implements IGetAllReviewsAdminUseCase {
  constructor(
    private reviewRepository: IReviewRepository,
    private courseRepository?: ICourseRepository,
    private bookingRepository?: IMentorshipBookingRepository,
  ) {}

  async execute(
    filters: AdminReviewFilters,
    page: number,
    limit: number,
  ): Promise<AdminReviewListResult> {
    const [reviews, total] = await Promise.all([
      this.reviewRepository.findAllForAdmin(filters, page, limit),
      this.reviewRepository.countAllForAdmin(filters),
    ]);

    // Enrich target names at the application use-case layer
    const courseMap = new Map<string, string>();
    const sessionMap = new Map<string, string>();

    if (this.courseRepository) {
      const courseIds = [
        ...new Set(
          reviews
            .filter((r) => r.targetType === 'course')
            .map((r) => r.targetId.toString()),
        ),
      ];
      await Promise.all(
        courseIds.map(async (id) => {
          try {
            const course = await this.courseRepository!.findById(id);
            if (course) courseMap.set(id, course.title);
          } catch {
            // Ignore single target lookup errors
          }
        }),
      );
    }

    if (this.bookingRepository) {
      const bookingIds = [
        ...new Set(
          reviews
            .filter((r) => r.targetType === 'session')
            .map((r) => r.targetId.toString()),
        ),
      ];
      await Promise.all(
        bookingIds.map(async (id) => {
          try {
            const booking = await this.bookingRepository!.findById(id);
            if (booking && booking.scheduledAt) {
              sessionMap.set(
                id,
                `Session on ${new Date(booking.scheduledAt).toLocaleDateString()}`,
              );
            }
          } catch {
            // Ignore single target lookup errors
          }
        }),
      );
    }

    const dtos: AdminReviewDto[] = reviews.map((r) => {
      const targetIdStr = r.targetId.toString();
      const resolvedTargetName =
        r.targetType === 'course'
          ? (courseMap.get(targetIdStr) ?? r.targetName)
          : r.targetType === 'session'
            ? (sessionMap.get(targetIdStr) ?? r.targetName)
            : r.targetName;

      return {
        reviewId: r.reviewId!,
        studentId: r.studentId,
        studentName: r.studentInfo?.name ?? 'Unknown',
        studentProfilePic: r.studentInfo?.profileImageUrl,
        targetType: r.targetType,
        targetId: r.targetId,
        targetName: resolvedTargetName,
        instructorId: r.instructorId,
        rating: r.rating,
        comment: r.comment,
        helpfulCount: r.helpfulCount,
        isHidden: r.isHidden,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    });

    return {
      reviews: dtos,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
