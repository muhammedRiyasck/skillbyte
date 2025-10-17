import { Router } from "express";
import multer from "multer";
const router = Router();
const upload = multer({ dest: 'uploads/' });

import { courseController } from "../dependencyInjection/CourseBaseContiner";
import { moduleWithLessonController } from "../dependencyInjection/ModuleWithLessonContiner";
import { lessonController } from "../dependencyInjection/LessonContiner";
import {authenticate} from "../../../../shared/middlewares/AuthMiddleware";
import { requireRole } from "../../../../shared/middlewares/RequireRole";
import { CustomLimit } from "../../../../shared/utils/RateLimiter";
import asyncHandler from "../../../../shared/utils/AsyncHandler";


router.post("/createbase",authenticate,requireRole('instructor'),asyncHandler(courseController.createBase));
router.post("/upload-thumbnail/:courseId", authenticate, requireRole('instructor'), upload.single('thumbnail'), asyncHandler(courseController.uploadThumbnail));
router.get("/instructor-courses",CustomLimit(5,'list courses'), authenticate, requireRole('instructor'), asyncHandler(courseController.getInstructorCourses));
router.get("/details/:courseId", authenticate, requireRole('instructor','student','admin'), asyncHandler(courseController.getCourseById));
router.get("/published-courses",CustomLimit(5,'list all courses'), authenticate,requireRole('student'), asyncHandler(courseController.getPublishedCourses));
router.get("/admin/courses", authenticate, requireRole('admin'), asyncHandler(courseController.getAllCourses));
router.patch("/course/:courseId", authenticate, requireRole('instructor','admin'), asyncHandler(courseController.updateBase));
router.patch("/course/:courseId/status", authenticate, requireRole('instructor'), asyncHandler(courseController.updateCourseStatus));
router.delete("/course/:courseId", authenticate, requireRole('instructor'), asyncHandler(courseController.deleteCourse));

// router.get('/modulesAndLessons/:courseId',authenticate, requireRole('instructor'), moduleWithLessonController.getModulesAndLessons)
router.post("/createmodule", authenticate, requireRole('instructor'), asyncHandler(moduleWithLessonController.createModule));
router.patch("/module/:moduleId", authenticate, requireRole('instructor'), asyncHandler(moduleWithLessonController.updateModule));
router.delete("/module/:moduleId", authenticate, requireRole('instructor'), asyncHandler(moduleWithLessonController.deleteModule));

router.post("/createlesson", authenticate, requireRole('instructor'), asyncHandler(lessonController.createLesson));
router.post("/presign", authenticate, requireRole('instructor'), asyncHandler(lessonController.getUploadUrl))
router.post("/signedUrl", authenticate, requireRole('instructor'), asyncHandler(lessonController.getVideoSignedUrls))
router.patch("/lesson/:lessonId", authenticate, requireRole('instructor'), asyncHandler(lessonController.updateLesson));
router.delete("/lesson/:lessonId", authenticate, requireRole('instructor'), asyncHandler(lessonController.deleteLesson));


export default router;
