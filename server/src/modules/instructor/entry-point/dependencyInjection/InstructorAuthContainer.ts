import {InstructorAuthController} from '../controllers/InstructorAuthController';

import { RegisterInstructorUseCase } from "../../application/use-cases/RegisterInstructorUseCase";
import { RedisOtpService } from "../../../../shared/services/otp/OtpService";

import { InstructorRepository } from "../../infrastructure/repositories/InstructorRepository";
import { ReapplyInstructorUseCase } from '../../application/use-cases/ReapplyInstructorUseCase';

const instructorRepo = new InstructorRepository();
const registerInstructorUC = new RegisterInstructorUseCase(instructorRepo, new RedisOtpService());
const generateOtpUC = new RedisOtpService(); 
const reapplyInstructorUseCase = new ReapplyInstructorUseCase(instructorRepo);

export const instructorAuthController = new InstructorAuthController(
  registerInstructorUC,
  generateOtpUC,
  reapplyInstructorUseCase
)
