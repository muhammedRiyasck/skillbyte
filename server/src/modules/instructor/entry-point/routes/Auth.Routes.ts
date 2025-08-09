import { Router } from "express";
import { instructorAuthController } from "../dependencyInjection/InstructorAuthContainer";

const router = Router();
router.post("/instructor/register", instructorAuthController.registerInstructor);
router.post("/instructor/verify-otp", instructorAuthController.verifyOtp);

export default router;
