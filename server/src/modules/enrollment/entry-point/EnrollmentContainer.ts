import { EnrollmentReadRepository } from '../infrastructure/repositories/EnrollmentReadRepository';
import { EnrollmentWriteRepository } from '../infrastructure/repositories/EnrollmentWriteRepository';
import { CheckEnrollmentUseCase } from '../application/use-cases/CheckEnrollmentUseCase';
import { GetInstructorEnrollmentsUseCase } from '../application/use-cases/GetInstructorEnrollmentsUseCase';
import { EnrollmentController } from './EnrollmentController';
import { UpdateLessonProgressUseCase } from '../application/use-cases/UpdateLessonProgressUseCase';
import { GetStudentEnrollmentsUseCase } from '../application/use-cases/GetStudentEnrollmentsUseCase';
import { EnrollmentFulfillmentService } from '../application/services/EnrollmentFulfillmentService';
import { InitiateEnrollmentPaymentUseCase } from '../application/use-cases/InitiateEnrollmentPaymentUseCase';
import { initiatePaymentUc } from '../../payment/entry-point/PaymentContainer';
import { LessonRepository } from '../../course/infrastructure/repositories/LessonRepository';

// Initialize repositories
const enrollmentReadRepo = new EnrollmentReadRepository();
const enrollmentWriteRepo = new EnrollmentWriteRepository();
const lessonRepo = new LessonRepository();

// Initialize use cases with split repository interfaces
const checkEnrollmentUc = new CheckEnrollmentUseCase(enrollmentReadRepo);
const getInstructorEnrollmentsUc = new GetInstructorEnrollmentsUseCase(
  enrollmentReadRepo,
);
const updateLessonProgressUc = new UpdateLessonProgressUseCase(
  enrollmentWriteRepo,
  lessonRepo,
);
const getStudentEnrollmentsUc = new GetStudentEnrollmentsUseCase(
  enrollmentReadRepo,
);
const initiateEnrollmentPaymentUc = new InitiateEnrollmentPaymentUseCase(
  enrollmentReadRepo,
  initiatePaymentUc,
);

// Initialize fulfillment service (listens to payment events)
const enrollmentFulfillmentService = new EnrollmentFulfillmentService(
  enrollmentReadRepo,
  enrollmentWriteRepo,
);

export const enrollmentController = new EnrollmentController(
  checkEnrollmentUc,
  getInstructorEnrollmentsUc,
  updateLessonProgressUc,
  getStudentEnrollmentsUc,
  initiateEnrollmentPaymentUc,
);

// Export fulfillment service for initialization in app startup
export { enrollmentFulfillmentService };
