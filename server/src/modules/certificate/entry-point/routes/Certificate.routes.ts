import express from 'express';
import { authenticate } from '../../../../shared/middlewares/AuthMiddleware';
import { requireRole } from '../../../../shared/middlewares/RequireRole';
import asyncHandler from '../../../../shared/utils/AsyncHandler';
import { certificateController } from '../CertificateContainer';

const router = express.Router();

// Public — no auth required
router.get(
  '/verify/:verificationCode',
  asyncHandler(certificateController.verifyCertificate),
);

// Student protected
router.post(
  '/course/:courseId/issue',
  authenticate,
  requireRole('student'),
  asyncHandler(certificateController.issueCertificate),
);

router.get(
  '/:certificateId',
  authenticate,
  requireRole('student'),
  asyncHandler(certificateController.getCertificate),
);

export default router;
