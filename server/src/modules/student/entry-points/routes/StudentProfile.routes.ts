import { Router } from 'express';
import { studentProfileController } from '../dependencyInjection/StudentProfileContainer';
import { authenticate } from '../../../../shared/middlewares/AuthMiddleware';
import { requireRole } from '../../../../shared/middlewares/RequireRole';
import asyncHandler from '../../../../shared/utils/AsyncHandler';
import { validateRequest } from '../../../../shared/middlewares/validateRequest';
import { StudentProfileUpdateSchema } from '../validations/StudentProfileUpdateValidation';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.get(
  '/profile',
  authenticate,
  requireRole('student'),
  asyncHandler(studentProfileController.getProfile),
);

router.put(
  '/profile',
  authenticate,
  requireRole('student'),
  validateRequest(StudentProfileUpdateSchema),
  asyncHandler(studentProfileController.updateProfile),
);

router.post(
  '/upload-profile-image',
  authenticate,
  requireRole('student'),
  upload.single('profileImage'),
  asyncHandler(studentProfileController.uploadProfileImage),
);

router.delete(
  '/profile-image',
  authenticate,
  requireRole('student'),
  asyncHandler(studentProfileController.removeProfileImage),
);

export default router;
