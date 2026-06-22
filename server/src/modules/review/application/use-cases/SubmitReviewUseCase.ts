import { IReviewRepository } from '../../domain/IRepositories/IReviewRepository';
import { ISubmitReviewUseCase } from '../interfaces/ISubmitReviewUseCase';
import { Review } from '../../domain/entities/Review';
import { ReviewMapper } from '../mappers/ReviewMapper';
import { ReviewResponseDto } from '../dtos/ReviewResponseDto';
import { ICourseRepository } from '../../../course/domain/IRepositories/ICourseRepository';
import { IEnrollmentReadRepository } from '../../../enrollment/domain/IRepositories/IEnrollmentReadRepository';
import { IMentorshipBookingRepository } from '../../../mentorship/domain/IRepositories/IMentorshipBookingRepository';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { BookingStatus } from '../../../mentorship/domain/entities/MentorshipBooking';

export class SubmitReviewUseCase implements ISubmitReviewUseCase {
  constructor(
    private reviewRepository: IReviewRepository,
    private courseRepository: ICourseRepository,
    private enrollmentRepository: IEnrollmentReadRepository,
    private bookingRepository: IMentorshipBookingRepository,
    private instructorRepository: IInstructorRepository,
  ) {}

  async execute(
    studentId: string,
    targetType: 'course' | 'session',
    targetId: string,
    rating: number,
    comment: string,
  ): Promise<ReviewResponseDto> {
    // 1. Check if user already reviewed
    const existing = await this.reviewRepository.findByStudentAndTarget(
      studentId,
      targetType,
      targetId,
    );
    if (existing) {
      throw new HttpError(
        'You have already reviewed this.',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    let instructorId = '';

    // 2. Validate Eligibility
    if (targetType === 'course') {
      const isEnrolled = await this.enrollmentRepository.findEnrollment(
        studentId,
        targetId,
      );
      if (!isEnrolled) {
        throw new HttpError(
          'Only enrolled students can review this course.',
          HttpStatusCode.FORBIDDEN,
        );
      }
      const course = await this.courseRepository.findById(targetId);
      if (!course) {
        throw new HttpError('Course not found.', HttpStatusCode.NOT_FOUND);
      }
      instructorId = course.instructorId.toString();
    } else if (targetType === 'session') {
      // For session, targetId is bookingId
      const booking = await this.bookingRepository.findById(targetId);
      if (!booking) {
        throw new HttpError('Booking not found.', HttpStatusCode.NOT_FOUND);
      }
      if (booking.studentId.toString() !== studentId) {
        throw new HttpError(
          'You are not authorized to review this session.',
          HttpStatusCode.FORBIDDEN,
        );
      }
      if (booking.status !== BookingStatus.COMPLETED) {
        throw new HttpError(
          'Only completed sessions can be reviewed.',
          HttpStatusCode.BAD_REQUEST,
        );
      }
      instructorId = booking.instructorId.toString();
    } else {
      throw new HttpError('Invalid targetType.', HttpStatusCode.BAD_REQUEST);
    }

    // 3. Create Review
    const newReview = new Review(
      studentId,
      targetType,
      targetId,
      instructorId,
      rating,
      comment,
    );

    const savedReview = await this.reviewRepository.save(newReview);

    // 4. Update Denormalized Averages
    if (targetType === 'course') {
      const stats = await this.reviewRepository.getAverageRating(
        targetType,
        targetId,
      );
      await this.courseRepository.updateBaseInfo(targetId, {
        averageRating: stats.average,
        totalReviews: stats.count,
      });
      // We will add averageRating and totalReviews to Course entity.
    }

    // 5. Update Instructor Stats
    if (instructorId) {
      const insStats =
        await this.reviewRepository.getInstructorAverageRating(instructorId);
      await this.instructorRepository.updateById(instructorId, {
        averageRating: insStats.average,
        totalReviews: insStats.count,
      });
    }

    return ReviewMapper.toDto(savedReview);
  }
}
