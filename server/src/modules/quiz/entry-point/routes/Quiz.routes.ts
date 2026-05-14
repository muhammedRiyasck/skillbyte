import { Router } from 'express';
import { quizController } from '../dependencyInjection/QuizDI';
import { requireRole } from '../../../../shared/middlewares/RequireRole';
import { authenticate } from '../../../../shared/middlewares/AuthMiddleware';
import { CustomLimit } from '../../../../shared/utils/RateLimiter';

const router = Router();
const requireInstructor = requireRole('instructor');
const requireStudent = requireRole('student');

// Config Routes (Instructor Only)
router.post(
  '/config',
  authenticate,
  requireInstructor,
  quizController.createConfig.bind(quizController),
);

router.put(
  '/config/:courseId',
  authenticate,
  requireInstructor,
  quizController.updateConfig.bind(quizController),
);

router.get(
  '/config/:courseId',
  authenticate,
  requireRole('instructor', 'student'),
  quizController.getConfig.bind(quizController),
);

// Analytics Route (Instructor Only)
router.get(
  '/analytics/:courseId',
  authenticate,
  requireInstructor,
  quizController.getAnalytics.bind(quizController),
);

router.delete(
  '/course/:courseId/attempts/:userId',
  authenticate,
  requireInstructor,
  quizController.resetStudentAttempts.bind(quizController),
);

// Student Routes
router.post(
  '/start/:courseId',
  authenticate,
  requireStudent,
  CustomLimit(60, 'starting a quiz'), // Limit generation attempts
  quizController.startAttempt.bind(quizController),
);

router.post(
  '/submit/:attemptId',
  authenticate,
  requireStudent,
  quizController.submitAttempt.bind(quizController),
);

router.get(
  '/result/:courseId',
  authenticate,
  requireStudent,
  quizController.getResult.bind(quizController),
);

router.get(
  '/attempts/:courseId',
  authenticate,
  requireStudent,
  quizController.getAllAttempts.bind(quizController),
);

export default router;
