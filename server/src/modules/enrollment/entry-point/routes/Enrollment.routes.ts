import express from "express";
import { enrollmentController } from "../EnrollmentContiner";
import { authenticate } from "../../../../shared/middlewares/AuthMiddleware"; 

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

export default router;
