import { Router } from 'express';
import multer from 'multer';
const router = Router();
const upload = multer({ dest: 'uploads/' });

import { courseController } from '../dependencyInjection/CourseBaseContiner';
import { moduleWithLessonController } from '../dependencyInjection/ModuleWithLessonContiner';
import { lessonController } from '../dependencyInjection/LessonContiner';
import { authenticate } from '../../../../shared/middlewares/AuthMiddleware';
import { requireRole } from '../../../../shared/middlewares/RequireRole';
import { CustomLimit } from '../../../../shared/utils/RateLimiter';
import asyncHandler from '../../../../shared/utils/AsyncHandler';

router.post(
  '/createbase',
  authenticate,
  requireRole('instructor'),
  asyncHandler(courseController.createBase),
);
router.post(
  '/upload-thumbnail/:id',
  authenticate,
  requireRole('instructor'),
  upload.single('thumbnail'),
  asyncHandler(courseController.uploadThumbnail),
);
router.get(
  '/categories',
  authenticate,
  asyncHandler(courseController.getCategories),
);
router.get(
  '/instructor-courses',
  CustomLimit(5, 'list courses'),
  authenticate,
  requireRole('instructor'),
  asyncHandler(courseController.getInstructorCourses),
);
router.get(
  '/details/:id',
  authenticate,
  requireRole('instructor', 'student', 'admin'),
  asyncHandler(courseController.getCourseById),
);
router.get(
  '/published-courses',
  CustomLimit(5, 'list all courses'),
  authenticate,
  requireRole('student'),
  asyncHandler(courseController.getPublishedCourses),
);
router.get(
  '/admin/courses',
  authenticate,
  requireRole('admin'),
  asyncHandler(courseController.getAllCourses),
);
router.patch(
  '/:id',
  authenticate,
  requireRole('instructor', 'admin'),
  asyncHandler(courseController.updateBase),
);
router.patch(
  '/:id/status',
  authenticate,
  requireRole('instructor'),
  asyncHandler(courseController.updateCourseStatus),
);
router.patch(
  '/:id/block',
  authenticate,
  requireRole('admin'),
  asyncHandler(courseController.blockCourse),
);
router.delete(
  '/:id',
  authenticate,
  requireRole('instructor'),
  asyncHandler(courseController.deleteCourse),
);

// router.get('/modulesAndLessons/:courseId',authenticate, requireRole('instructor'), moduleWithLessonController.getModulesAndLessons)
router.post(
  '/createmodule',
  authenticate,
  requireRole('instructor'),
  asyncHandler(moduleWithLessonController.createModule),
);
router.patch(
  '/module/:id',
  authenticate,
  requireRole('instructor'),
  asyncHandler(moduleWithLessonController.updateModule),
);
router.delete(
  '/module/:id',
  authenticate,
  requireRole('instructor'),
  asyncHandler(moduleWithLessonController.deleteModule),
);

router.post(
  '/createlesson',
  authenticate,
  requireRole('instructor'),
  asyncHandler(lessonController.createLesson),
);
router.post(
  '/presign',
  authenticate,
  requireRole('instructor'),
  asyncHandler(lessonController.getUploadUrl),
);
router.post(
  '/signedUrl',
  authenticate,
  requireRole('instructor'),
  asyncHandler(lessonController.getVideoSignedUrls),
);
router.get(
  '/lesson/:id/play',
  authenticate,
  requireRole('student', 'instructor', 'admin'),
  asyncHandler(lessonController.getLessonPlayUrl),
);
router.get('/lesson/:id/hls/:file', asyncHandler(lessonController.streamHls));
router.patch(
  '/lesson/:id',
  authenticate,
  requireRole('instructor'),
  asyncHandler(lessonController.updateLesson),
);
router.patch(
  '/lesson/:id/block',
  authenticate,
  requireRole('admin'),
  asyncHandler(lessonController.blockLesson),
);
router.delete(
  '/lesson/:id',
  authenticate,
  requireRole('instructor'),
  asyncHandler(lessonController.deleteLesson),
);

export default router;
