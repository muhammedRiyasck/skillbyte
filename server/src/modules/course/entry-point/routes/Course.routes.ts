import { Router } from "express";
import multer from "multer";
const router = Router();
const upload = multer({ dest: 'uploads/' });

import { courseController } from "../dependencyInjection/CourseBaseContiner";
import { moduleWithLessonController } from "../dependencyInjection/ModuleWithLessonContiner";
import { lessonController } from "../dependencyInjection/LessonContiner";
import {authenticate} from "../../../../shared/middlewares/AuthMiddleware";
import { requireRole } from "../../../../shared/middlewares/RequireRole";


router.post("/createbase",authenticate,requireRole('instructor'),courseController.createBase);
router.post("/upload-thumbnail/:id", authenticate, requireRole('instructor'), upload.single('thumbnail'), courseController.uploadThumbnail);
router.get("/courses", authenticate, requireRole('instructor'), courseController.getInstructorCourses);
router.get("/course/:courseId", authenticate, requireRole('instructor','student','admin'), courseController.getCourseById);
router.get("/courses", authenticate,requireRole('student'), courseController.getPublishedCourses);
router.get("/admin/courses", authenticate, requireRole('admin'), courseController.getAllCourses);
router.patch("/course/:courseId", authenticate, requireRole('instructor','admin'), courseController.updateBase);
router.patch("/course/:courseId/status", authenticate, requireRole('instructor'), courseController.updateCourseStatus);
router.delete("/course/:courseId", authenticate, requireRole('instructor'), courseController.deleteCourse);

router.post("/module", authenticate, requireRole('instructor'), moduleWithLessonController.createModuleWithLessons);
router.patch("/module/:moduleId", authenticate, requireRole('instructor'), moduleWithLessonController.updateModule);
router.delete("/module/:moduleId", authenticate, requireRole('instructor'), moduleWithLessonController.deleteModule);

router.post("/lesson", authenticate, requireRole('instructor'), lessonController.createLesson);
router.patch("/lesson/:lessonId", authenticate, requireRole('instructor'), lessonController.updateLesson);
router.delete("/lesson/:lessonId", authenticate, requireRole('instructor'), lessonController.deleteLesson);


export default router;
