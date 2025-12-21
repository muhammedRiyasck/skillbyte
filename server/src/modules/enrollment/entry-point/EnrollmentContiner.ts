import { CreatePaymentIntentUseCase } from '../application/use-cases/CreatePaymentIntentUseCase';
import { HandleStripeWebhookUseCase } from '../application/use-cases/HandleStripeWebhookUseCase';
import { CheckEnrollmentUseCase } from '../application/use-cases/CheckEnrollmentUseCase';
import { GetInstructorEnrollmentsUseCase } from '../application/use-cases/GetInstructorEnrollmentsUseCase';
import { EnrollmentRepository } from '../infrastructure/repositories/EnrollmentRepository';
import { EnrollmentController } from './EnrollmentController';
import { UpdateLessonProgress } from '../application/use-cases/UpdateLessonProgress';
import { GetUserPurchasesUseCase } from '../application/use-cases/GetUserPurchasesUseCase';
import { GetInstructorEarningsUseCase } from '../application/use-cases/GetInstructorEarningsUseCase';

const enrollmentRepo = new EnrollmentRepository();
const createPaymentIntentUc = new CreatePaymentIntentUseCase(enrollmentRepo);
const handleStripeWebhookUc = new HandleStripeWebhookUseCase(enrollmentRepo);
const checkEnrollmentUc = new CheckEnrollmentUseCase(enrollmentRepo);
const getInstructorEnrollmentsUc = new GetInstructorEnrollmentsUseCase(
  enrollmentRepo,
);
const updateLessonProgressUc = new UpdateLessonProgress(enrollmentRepo);
const getUserPurchasesUc = new GetUserPurchasesUseCase(enrollmentRepo);
const getInstructorEarningsUc = new GetInstructorEarningsUseCase(
  enrollmentRepo,
);

export const enrollmentController = new EnrollmentController(
  createPaymentIntentUc,
  handleStripeWebhookUc,
  checkEnrollmentUc,
  getInstructorEnrollmentsUc,
  updateLessonProgressUc,
  getUserPurchasesUc,
  getInstructorEarningsUc,
);
