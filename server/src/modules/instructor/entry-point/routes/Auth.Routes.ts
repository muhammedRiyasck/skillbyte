import { Router } from "express";
import { instructorAuthController } from "../dependencyInjection/InstructorAuthContainer";
import asyncHandler from "../../../../shared/utils/AsyncHandler";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/register", upload.single("resume"), asyncHandler(instructorAuthController.registerInstructor));
router.post("/verify-otp", asyncHandler(instructorAuthController.verifyOtp));

export default router;

