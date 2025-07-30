import { Router } from "express";
const router = Router();

import { courseController } from "../dependencyInjection/CourseBaseContiner";
import { moduleWithLessonController } from "../dependencyInjection/ModuleWithLessonContiner";
import { lessonController } from "../dependencyInjection/LessonContiner";
import {authenticate} from "../../../../shared/middlewares/authMiddleware";
import { requireRole } from "../../../../shared/middlewares/requireRole";



router.post("/instructor/createbase",authenticate,requireRole('instructor'),courseController.createBase);
router.get("/instructor/courses", authenticate, requireRole('instructor'), courseController.getInstructorCourses);
router.get("/instructor/course/:courseId", authenticate, requireRole('instructor','student','admin'), courseController.getCourseById);// security check for instructor and student
router.get("/courses", authenticate,requireRole('student'), courseController.getPublishedCourses);
router.get("/admin/courses", authenticate, requireRole('admin'), courseController.getAllCourses);
router.patch("/instructor/course/:courseId", authenticate, requireRole('instructor','admin'), courseController.updateBase);
router.patch("/instructor/course/:courseId/status", authenticate, requireRole('instructor'), courseController.updateCourseStatus);
router.delete("/instructor/course/:courseId", authenticate, requireRole('instructor'), courseController.deleteCourse);

router.post("/instructor/module", authenticate, requireRole('instructor'), moduleWithLessonController.createModuleWithLessons);
router.patch("/instructor/module/:moduleId", authenticate, requireRole('instructor'), moduleWithLessonController.updateModule);
router.delete("/instructor/module/:moduleId", authenticate, requireRole('instructor'), moduleWithLessonController.deleteModule);

router.post("/instructor/lesson", authenticate, requireRole('instructor'), lessonController.createLesson);
router.patch("/instructor/lesson/:lessonId", authenticate, requireRole('instructor'), lessonController.updateLesson);
router.delete("/instructor/lesson/:lessonId", authenticate, requireRole('instructor'), lessonController.deleteLesson);


export default router;
