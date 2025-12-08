import express from "express";
import { EnrollmentController } from "../EnrollmentController";
import { authenticate } from "../../../../shared/middlewares/AuthMiddleware"; 

const router = express.Router();
const controller = new EnrollmentController();

// Create Payment Intent - Protected Route
router.post("/create-payment-intent", authenticate, async (req, res) => {
    await controller.createPaymentIntent(req, res);
});


// This route is primarily for mounting logic reference, but the raw body handling 
// must be ensured in the main app configuration if global parsers interfere.
router.post("/webhook", async (req, res) => {
    await controller.handleWebhook(req, res);
});

export default router;
