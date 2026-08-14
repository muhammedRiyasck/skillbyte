import { QuizConfigRepository } from '../../infrastructure/repositories/QuizConfigRepository';
import { CreateQuizConfigUseCase } from '../../application/use-cases/CreateQuizConfigUseCase';
import { UpdateQuizConfigUseCase } from '../../application/use-cases/UpdateQuizConfigUseCase';
import { GetQuizConfigUseCase } from '../../application/use-cases/GetQuizConfigUseCase';
import { StartQuizAttemptUseCase } from '../../application/use-cases/StartQuizAttemptUseCase';
import { SubmitQuizAttemptUseCase } from '../../application/use-cases/SubmitQuizAttemptUseCase';
import { GetQuizResultUseCase } from '../../application/use-cases/GetQuizResultUseCase';
import { GetQuizAnalyticsUseCase } from '../../application/use-cases/GetQuizAnalyticsUseCase';
import { ResetStudentQuizAttemptsUseCase } from '../../application/use-cases/ResetStudentQuizAttemptsUseCase';
import { GetAllQuizAttemptsUseCase } from '../../application/use-cases/GetAllQuizAttemptsUseCase';
import { aiQuizService } from '../../../../shared/services/ai/GeminiQuizService';
import { QuizAttemptRepository } from '../../infrastructure/repositories/QuizAttemptRepository';
import { EnrollmentReadRepository } from '../../../enrollment/infrastructure/repositories/EnrollmentReadRepository';
import { EnrollmentWriteRepository } from '../../../enrollment/infrastructure/repositories/EnrollmentWriteRepository';
import { CourseRepository } from '../../../course/infrastructure/repositories/CourseRepository';
import { QuizController } from '../controllers/QuizController';

const quizConfigRepository = new QuizConfigRepository();
const quizAttemptRepository = new QuizAttemptRepository();
const enrollmentReadRepository = new EnrollmentReadRepository();
const enrollmentWriteRepository = new EnrollmentWriteRepository();
const courseRepository = new CourseRepository();

const createQuizConfigUseCase = new CreateQuizConfigUseCase(
  quizConfigRepository,
  aiQuizService,
  courseRepository,
);
const updateQuizConfigUseCase = new UpdateQuizConfigUseCase(
  quizConfigRepository,
  aiQuizService,
  courseRepository,
);
const getQuizConfigUseCase = new GetQuizConfigUseCase(quizConfigRepository);

const startQuizAttemptUseCase = new StartQuizAttemptUseCase(
  quizAttemptRepository,
  quizConfigRepository,
  aiQuizService,
  enrollmentReadRepository,
  courseRepository,
);

const submitQuizAttemptUseCase = new SubmitQuizAttemptUseCase(
  quizAttemptRepository,
  quizConfigRepository,
  enrollmentReadRepository,
  enrollmentWriteRepository,
  aiQuizService,
);

const getQuizResultUseCase = new GetQuizResultUseCase(quizAttemptRepository);
const getAllQuizAttemptsUseCase = new GetAllQuizAttemptsUseCase(
  quizAttemptRepository,
);
const getQuizAnalyticsUseCase = new GetQuizAnalyticsUseCase(
  quizAttemptRepository,
  quizConfigRepository,
);
const resetStudentAttemptsUseCase = new ResetStudentQuizAttemptsUseCase(
  quizAttemptRepository,
  quizConfigRepository,
  enrollmentReadRepository,
  enrollmentWriteRepository,
);

const quizController = new QuizController(
  createQuizConfigUseCase,
  updateQuizConfigUseCase,
  getQuizConfigUseCase,
  startQuizAttemptUseCase,
  submitQuizAttemptUseCase,
  getQuizResultUseCase,
  getAllQuizAttemptsUseCase,
  getQuizAnalyticsUseCase,
  resetStudentAttemptsUseCase,
);

export { quizController, quizConfigRepository };
