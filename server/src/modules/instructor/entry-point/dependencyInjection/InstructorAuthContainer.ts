import { InstructorAuthController } from '../controllers/InstructorAuthController';

import { RegisterInstructorUseCase } from '../../application/use-cases/RegisterInstructorUseCase';
import { RedisOtpService } from '../../../../shared/services/otp/OtpService';

import { ReapplyInstructorUseCase } from '../../application/use-cases/ReapplyInstructorUseCase';

import { instructorRepo } from '../../../auth/entry-point/dependencyInjection/CommonAuthContainer';
import { OtpRateLimiter } from '../../../../shared/services/otp/OtpRateLimiter';

const otpRateLimiter = new OtpRateLimiter();
const OtpService = new RedisOtpService(otpRateLimiter);

const registerInstructorUC = new RegisterInstructorUseCase(
  instructorRepo,
  OtpService,
);
const reapplyInstructorUseCase = new ReapplyInstructorUseCase(instructorRepo);

export const instructorAuthController = new InstructorAuthController(
  registerInstructorUC,
  OtpService,
  reapplyInstructorUseCase,
);
