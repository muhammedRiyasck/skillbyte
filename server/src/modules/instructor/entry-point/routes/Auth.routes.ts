import { Router } from 'express';
import { instructorAuthController } from '../dependencyInjection/InstructorAuthContainer';
import asyncHandler from '../../../../shared/utils/AsyncHandler';
import { validateRequest } from '../../../../shared/middlewares/validateRequest';
import multer from 'multer';
import { InstructorRegistrationSchema } from '../validations/InstructorRegistrationValidation';
import { InstructorVerifyOtpSchema } from '../validations/InstructorVerifyOtpValidation';
import { InstructorReapplySchema } from '../validations/InstructorReapplyValidation';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post(
  '/register',
  upload.single('resume'),
  validateRequest(InstructorRegistrationSchema),
  asyncHandler(instructorAuthController.registerInstructor),
);

router.post(
  '/verify-otp',
  validateRequest(InstructorVerifyOtpSchema),
  asyncHandler(instructorAuthController.verifyOtp),
);

router.put(
  '/reapply',
  upload.single('resume'),
  validateRequest(InstructorReapplySchema),
  asyncHandler(instructorAuthController.reapply),
);

export default router;
