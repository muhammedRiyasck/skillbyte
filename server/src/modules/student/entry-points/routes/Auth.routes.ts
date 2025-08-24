import { Router } from "express";
import { studentAuthController } from "../dependencyInjection/StudentauthContainer";

import asyncHandler from "../../../../shared/utils/AsyncHandler";
import { fiveMinLimit } from "../../../../shared/utils/RateLimiter";

const router = Router();

router.post("/register", asyncHandler(studentAuthController.registerStudent));
router.post("/verify-otp",fiveMinLimit, asyncHandler(studentAuthController.verifyOtp));

// router.post("/resend-otp", studentAuthController.resendOtp);
// router.post("/forgot-password", studentAuthController.forgotPassword);
// router.post("/reset-password", studentAuthController.resetPassword);
// router.post("/update-profile", studentAuthController.updateProfile);
// router.get("/profile", studentAuthController.getProfile);
// router.post("/change-password", studentAuthController.changePassword);
// router.post("/logout", studentAuthController.logout);
// router.get("/courses", studentAuthController.getCourses);
// router.get("/course/:courseId", studentAuthController.getCourseDetails);
// router.post("/enroll-course", studentAuthController.enrollCourse);
// router.get("/enrolled-courses", studentAuthController.getEnrolledCourses);
// router.post("/unenroll-course", studentAuthController.unenrollCourse);
// router.get("/notifications", studentAuthController.getNotifications);
// router.post("/mark-notification-read", studentAuthController.markNotificationRead);
// router.post("/delete-notification", studentAuthController.deleteNotification);
// router.get("/instructor/:instructorId", studentAuthController.getInstructorProfile);
// router.get("/instructors", studentAuthController.getInstructors);
// router.post("/report-issue", studentAuthController.reportIssue);


export default router;
