import { Router } from 'express';
import {
  quizConfigController,
  quizAttemptController,
} from '../dependencyInjection/QuizDI';
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
  quizConfigController.createConfig,
);

router.put(
  '/config/:courseId',
  authenticate,
  requireInstructor,
  validateRequest(UpdateQuizConfigSchema),
  quizConfigController.updateConfig,
);

router.get(
  '/config/:courseId',
  authenticate,
  requireRole('instructor', 'student'),
  quizConfigController.getConfig,
);

// Analytics Route (Instructor Only)
router.get(
  '/analytics/:courseId',
  authenticate,
  requireInstructor,
  quizConfigController.getAnalytics,
);

router.delete(
  '/course/:courseId/attempts/:userId',
  authenticate,
  requireInstructor,
  quizConfigController.resetStudentAttempts,
);

// Student Routes
router.post(
  '/start/:courseId',
  authenticate,
  requireStudent,
  CustomLimit(60, 'starting a quiz'), // Limit generation attempts
  quizAttemptController.startAttempt,
);

router.post(
  '/submit/:attemptId',
  authenticate,
  requireStudent,
  validateRequest(SubmitQuizAttemptSchema),
  quizAttemptController.submitAttempt,
);

router.get(
  '/result/:courseId',
  authenticate,
  requireStudent,
  quizAttemptController.getResult,
);

router.get(
  '/attempts/:courseId',
  authenticate,
  requireStudent,
  quizAttemptController.getAllAttempts,
);

export default router;
