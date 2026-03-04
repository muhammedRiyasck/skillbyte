import { InstructorAuthController } from '../controllers/InstructorAuthController';

import { RegisterInstructorUseCase } from '../../application/use-cases/RegisterInstructorUseCase';
import { RedisOtpService } from '../../../../shared/services/otp/OtpService';

import { ReapplyInstructorUseCase } from '../../application/use-cases/ReapplyInstructorUseCase';

import { instructorRepo } from '../../../auth/entry-point/dependencyInjection/CommonAuthContainer';
import { OtpRateLimiter } from '../../../../shared/services/otp/OtpRateLimiter';
import { S3StorageService } from '../../../../shared/services/file-upload/services/S3StorageService';
import { IOtpService } from '../../../../shared/services/otp/interfaces/IOtpService';
import { TempInstructorData } from '../../../../shared/services/otp/interfaces/ITempInstructorData ';

const otpRateLimiter = new OtpRateLimiter();
const OtpService = new RedisOtpService(otpRateLimiter, 60);

const registerInstructorUC = new RegisterInstructorUseCase(
  instructorRepo,
  OtpService as IOtpService<TempInstructorData>,
);
const storageService = new S3StorageService();
const reapplyInstructorUseCase = new ReapplyInstructorUseCase(
  instructorRepo,
  storageService,
);

export const instructorAuthController = new InstructorAuthController(
  registerInstructorUC,
  OtpService,
  reapplyInstructorUseCase,
);
