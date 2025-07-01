import {InstructorAuthController} from '../controllers/InstructorAuthController';

import { RegisterInstructorUseCase } from "../../application/use-cases/RegisterInstructorUseCase";
import { RedisOtpService } from "../../../../shared/services/otp/OtpService";

import { MongoInstructorRepository } from "../../infrastructure/repositories/MongoInstructorRepository";

const instructorRepo = new MongoInstructorRepository();
const registerInstructorUC = new RegisterInstructorUseCase(instructorRepo, new RedisOtpService());
const generateOtpUC = new RedisOtpService(); 

export const instructorAuthController = new InstructorAuthController(
  registerInstructorUC,
  generateOtpUC,
)
