import express from "express";
import { enrollmentController } from "../EnrollmentContiner";
import { authenticate } from "../../../../shared/middlewares/AuthMiddleware"; 
import { requireRole } from "../../../../shared/middlewares/RequireRole";

const router = express.Router();


// Create Payment Intent - Protected Route
router.post("/create-payment-intent", authenticate, async (req, res) => {
    await enrollmentController.createPaymentIntent(req, res);
});

// Check Enrollment Status - Protected Route
router.get("/check/:courseId", authenticate, async (req, res) => {
    await enrollmentController.checkEnrollmentStatus(req, res);
});


// This route is primarily for mounting logic reference, but the raw body handling 
// must be ensured in the main app configuration if global parsers interfere.
router.post("/webhook", async (req, res) => {
    await enrollmentController.handleWebhook(req, res);
});


router.get("/check/:courseId", authenticate, async (req, res) => {
    await enrollmentController.checkEnrollmentStatus(req, res);
});

// Check Enrollment Status - Protected Route
router.get("/check/:courseId", authenticate, async (req, res) => {
    await enrollmentController.checkEnrollmentStatus(req, res);
});

// Get Instructor Enrollments - Protected Route
router.get("/instructor-enrollments", authenticate, requireRole('instructor'), async (req, res) => {
    await enrollmentController.getInstructorEnrollments(req, res);
});

// Update Lesson Progress - Protected Route
router.patch("/:enrollmentId/lesson-progress", authenticate, async (req, res) => {
    await enrollmentController.updateProgress(req, res);
});

export default router;
