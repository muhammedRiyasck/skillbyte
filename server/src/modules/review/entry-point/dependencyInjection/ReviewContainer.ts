import { ReviewController } from '../controllers/ReviewController';
import { SubmitReviewUseCase } from '../../application/use-cases/SubmitReviewUseCase';
import { UpdateReviewUseCase } from '../../application/use-cases/UpdateReviewUseCase';
import { DeleteReviewUseCase } from '../../application/use-cases/DeleteReviewUseCase';
import { GetReviewsUseCase } from '../../application/use-cases/GetReviewsUseCase';
import { GetCourseRatingSummaryUseCase } from '../../application/use-cases/GetCourseRatingSummaryUseCase';
import { ToggleHelpfulReviewUseCase } from '../../application/use-cases/ToggleHelpfulReviewUseCase';
import { ReportReviewUseCase } from '../../application/use-cases/ReportReviewUseCase';
import { GetMySessionRatingsUseCase } from '../../application/use-cases/GetMySessionRatingsUseCase';
import { GetAllReviewsAdminUseCase } from '../../application/use-cases/GetAllReviewsAdminUseCase';
import { AdminToggleHideReviewUseCase } from '../../application/use-cases/AdminToggleHideReviewUseCase';
import { AdminDeleteReviewUseCase } from '../../application/use-cases/AdminDeleteReviewUseCase';
import { ReplyToReviewUseCase } from '../../application/use-cases/ReplyToReviewUseCase';
import { GetInstructorReviewsUseCase } from '../../application/use-cases/GetInstructorReviewsUseCase';
import { ReviewRepository } from '../../infrastructure/repositories/ReviewRepository';
import { CourseRepository } from '../../../course/infrastructure/repositories/CourseRepository';
import { EnrollmentReadRepository } from '../../../enrollment/infrastructure/repositories/EnrollmentReadRepository';
import { MentorshipBookingRepository } from '../../../mentorship/infrastructure/repositories/MentorshipBookingRepository';
import { InstructorRepository } from '../../../instructor/infrastructure/repositories/InstructorRepository';

const reviewRepository = new ReviewRepository();
const courseRepository = new CourseRepository();
const enrollmentRepository = new EnrollmentReadRepository();
const bookingRepository = new MentorshipBookingRepository();
const instructorRepository = new InstructorRepository();

const submitReviewUC = new SubmitReviewUseCase(
  reviewRepository,
  courseRepository,
  enrollmentRepository,
  bookingRepository,
  instructorRepository,
);

const updateReviewUC = new UpdateReviewUseCase(
  reviewRepository,
  courseRepository,
  instructorRepository,
);

const deleteReviewUC = new DeleteReviewUseCase(
  reviewRepository,
  courseRepository,
  instructorRepository,
);

const getReviewsUC = new GetReviewsUseCase(reviewRepository);

const getCourseRatingSummaryUC = new GetCourseRatingSummaryUseCase(
  reviewRepository,
);

const toggleHelpfulReviewUC = new ToggleHelpfulReviewUseCase(reviewRepository);

const reportReviewUC = new ReportReviewUseCase(reviewRepository);

const getMySessionRatingsUC = new GetMySessionRatingsUseCase(reviewRepository);

const getAllReviewsAdminUC = new GetAllReviewsAdminUseCase(reviewRepository);
const adminToggleHideReviewUseCase = new AdminToggleHideReviewUseCase(
  reviewRepository,
);
const adminDeleteReviewUseCase = new AdminDeleteReviewUseCase(reviewRepository);
const replyToReviewUseCase = new ReplyToReviewUseCase(reviewRepository);
const getInstructorReviewsUseCase = new GetInstructorReviewsUseCase(
  reviewRepository,
);

export const reviewController = new ReviewController(
  submitReviewUC,
  updateReviewUC,
  deleteReviewUC,
  getReviewsUC,
  getCourseRatingSummaryUC,
  toggleHelpfulReviewUC,
  reportReviewUC,
  getMySessionRatingsUC,
  getAllReviewsAdminUC,
  adminToggleHideReviewUseCase,
  adminDeleteReviewUseCase,
  replyToReviewUseCase,
  getInstructorReviewsUseCase,
);

export { reviewRepository };
