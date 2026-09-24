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

/** Executes the business logic for get all reviews admin. */
export class GetAllReviewsAdminUseCase implements IGetAllReviewsAdminUseCase {
  constructor(
    private reviewRepository: IReviewRepository,
    private courseRepository?: ICourseRepository,
    private bookingRepository?: IMentorshipBookingRepository,
  ) {}

  /**
   * Execute for the GetAllReviewsAdmin entity.
   *
   * @param filters - The filters information.
   * @param page - The page information.
   * @param limit - The limit information.
   * @returns The result of the operation.
   */
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

    const courseIds = this.courseRepository
      ? [
          ...new Set(
            reviews
              .filter((r) => r.targetType === 'course')
              .map((r) => r.targetId.toString()),
          ),
        ]
      : [];

    const bookingIds = this.bookingRepository
      ? [
          ...new Set(
            reviews
              .filter((r) => r.targetType === 'session')
              .map((r) => r.targetId.toString()),
          ),
        ]
      : [];

    const [courses, bookings] = await Promise.all([
      courseIds.length && this.courseRepository
        ? this.courseRepository.findByIds(courseIds).catch(() => [])
        : Promise.resolve([]),
      bookingIds.length && this.bookingRepository
        ? this.bookingRepository.findByIds(bookingIds).catch(() => [])
        : Promise.resolve([]),
    ]);

    for (const course of courses) {
      if (course.courseId) {
        courseMap.set(course.courseId.toString(), course.title);
      }
    }

    for (const booking of bookings) {
      if (booking.bookingId && booking.scheduledAt) {
        sessionMap.set(
          booking.bookingId.toString(),
          `Session on ${new Date(booking.scheduledAt).toLocaleDateString()}`,
        );
      }
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
