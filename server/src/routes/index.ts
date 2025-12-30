import express from 'express';
import AuthRoutes from '../modules/auth/entry-point/routes/Auth.routes';
import AdminAuthRoutes from '../modules/admin/entry-points/routes/Auth.routes';
import StudentauthRoutes from '../modules/student/entry-points/routes/Auth.routes';
import AdminStudentRoutes from '../modules/student/entry-points/routes/AdminStudent.routes';
import InstructorauthRoutes from '../modules/instructor/entry-point/routes/Auth.routes';
import InstructorProfileRoutes from '../modules/instructor/entry-point/routes/InstructorProfile.routes';
import AdminInstructorRoutes from '../modules/instructor/entry-point/routes/AdminInstructor.routes';
import CourseRoutes from '../modules/course/entry-point/routes/Course.routes';
import EnrollmentRoutes from '../modules/enrollment/entry-point/routes/Enrollment.routes';

const router = express.Router();

router.use('/auth', AuthRoutes);
router.use('/student', StudentauthRoutes);
router.use('/students', AdminStudentRoutes);
router.use('/instructor', InstructorauthRoutes);
router.use('/instructor', InstructorProfileRoutes);
router.use('/instructors', AdminInstructorRoutes);
router.use('/course', CourseRoutes);
router.use('/enrollment', EnrollmentRoutes);
router.use('/admin', AdminAuthRoutes);

export default router;
