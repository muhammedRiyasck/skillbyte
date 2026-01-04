import express from 'express';
import { enrollmentController } from '../EnrollmentContiner';
import { authenticate } from '../../../../shared/middlewares/AuthMiddleware';
import { requireRole } from '../../../../shared/middlewares/RequireRole';

const router = express.Router();



// Check Enrollment Status - Protected Route
router.get('/check/:courseId', authenticate, async (req, res) => {
  await enrollmentController.checkEnrollmentStatus(req, res);
});



// Get Student Enrolled Courses - Protected Route
router.get('/my-enrollments', authenticate, async (req, res) => {
  await enrollmentController.getStudentEnrollments(req, res);
});

router.get(
  '/instructor-enrollments',
  authenticate,
  requireRole('instructor'),
  async (req, res) => {
    await enrollmentController.getInstructorEnrollments(req, res);
  },
);



// Update Lesson Progress - Protected Route
router.patch(
  '/:enrollmentId/lesson-progress',
  authenticate,
  async (req, res) => {
    await enrollmentController.updateProgress(req, res);
  },
);

export default router;
