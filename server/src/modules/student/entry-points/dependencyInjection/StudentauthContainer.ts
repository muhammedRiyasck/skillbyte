import { StudentAuthController } from '../controllers/StudentAuthController';

import { RegisterStudentUseCase } from '../../application/use-cases/RegisterStudentUseCase';

import { RedisOtpService } from '../../../../shared/services/otp/OtpService';

// Instantiate services
import { studentRepo } from '../../../auth/entry-point/dependencyInjection/CommonAuthContainer';
import { OtpRateLimiter } from '../../../../shared/services/otp/OtpRateLimiter';

const otpRateLimiter = new OtpRateLimiter();
const OtpService = new RedisOtpService(otpRateLimiter);

// Instantiate use cases
const registerStudentUC = new RegisterStudentUseCase(studentRepo, OtpService);
// const loginUC = new LoginStudentUseCase(studentRepo);
const generateOtpUC = OtpService;

// Final controller
export const studentAuthController = new StudentAuthController(
  registerStudentUC,
  generateOtpUC,
);
