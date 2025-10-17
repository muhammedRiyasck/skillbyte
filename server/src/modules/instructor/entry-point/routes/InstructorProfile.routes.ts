import { Router } from "express";
import { instructorProfileController } from "../dependencyInjection/InstructorProfileContainer";
import { authenticate } from "../../../../shared/middlewares/AuthMiddleware";
import { requireRole } from "../../../../shared/middlewares/RequireRole";
import asyncHandler from "../../../../shared/utils/AsyncHandler";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.get(
  "/profile",
  authenticate,
  requireRole("instructor"),
  asyncHandler(instructorProfileController.getProfile)
);

router.put(
  "/profile",
  authenticate,
  requireRole("instructor"),
  asyncHandler(instructorProfileController.updateProfile)
);

router.post(
  "/upload-profile-image",
  authenticate,
  requireRole("instructor"),
  upload.single("profileImage"),
  asyncHandler(instructorProfileController.uploadProfileImage)
);

router.delete(
  "/profile-image",
  authenticate,
  requireRole("instructor"),
  asyncHandler(instructorProfileController.removeProfileImage)
);

export default router;
