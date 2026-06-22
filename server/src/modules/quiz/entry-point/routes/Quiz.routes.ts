import { Router } from 'express';
import { quizController } from '../dependencyInjection/QuizDI';
import { requireRole } from '../../../../shared/middlewares/RequireRole';
import { authenticate } from '../../../../shared/middlewares/AuthMiddleware';
import { CustomLimit } from '../../../../shared/utils/RateLimiter';
import { validateRequest } from '../../../../shared/middlewares/validateRequest';
import {
  QuizConfigSchema,
  UpdateQuizConfigSchema,
  SubmitQuizAttemptSchema,
} from '../validations/QuizValidation';

const router = Router();
const requireInstructor = requireRole('instructor');
const requireStudent = requireRole('student');

// Config Routes (Instructor Only)
router.post(
  '/config',
  authenticate,
  requireInstructor,
  validateRequest(QuizConfigSchema),
  quizController.createConfig,
);

router.put(
  '/config/:courseId',
  authenticate,
  requireInstructor,
  validateRequest(UpdateQuizConfigSchema),
  quizController.updateConfig,
);

router.get(
  '/config/:courseId',
  authenticate,
  requireRole('instructor', 'student'),
  quizController.getConfig,
);

// Analytics Route (Instructor Only)
router.get(
  '/analytics/:courseId',
  authenticate,
  requireInstructor,
  quizController.getAnalytics,
);

router.delete(
  '/course/:courseId/attempts/:userId',
  authenticate,
  requireInstructor,
  quizController.resetStudentAttempts,
);

// Student Routes
router.post(
  '/start/:courseId',
  authenticate,
  requireStudent,
  CustomLimit(60, 'starting a quiz'), // Limit generation attempts
  quizController.startAttempt,
);

router.post(
  '/submit/:attemptId',
  authenticate,
  requireStudent,
  validateRequest(SubmitQuizAttemptSchema),
  quizController.submitAttempt,
);

router.get(
  '/result/:courseId',
  authenticate,
  requireStudent,
  quizController.getResult,
);

router.get(
  '/attempts/:courseId',
  authenticate,
  requireStudent,
  quizController.getAllAttempts,
);

export default router;
