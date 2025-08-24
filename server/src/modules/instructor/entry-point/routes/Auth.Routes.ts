import { Router } from "express";
import { instructorAuthController } from "../dependencyInjection/InstructorAuthContainer";
import asyncHandler from "../../../../shared/utils/AsyncHandler";

const router = Router();
router.post("/register", asyncHandler(instructorAuthController.registerInstructor));
router.post("/verify-otp", asyncHandler(instructorAuthController.verifyOtp));

export default router;
