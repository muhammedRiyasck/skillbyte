import { StudentAuthController } from "../controllers/StudentAuthController";

import { RegisterStudentUseCase } from "../../application/use-cases/RegisterStudentUseCase";
import { LoginStudentUseCase } from "../../application/use-cases/LoginStudentUseCase";
import { RedisOtpService } from "../../../../shared/services/otp/OtpService";

import { StudentRepository } from "../../infrastructure/repositories/StudentRepository";

// Instantiate services
const studentRepo = new StudentRepository();

// Instantiate use cases
const registerStudentUC = new RegisterStudentUseCase(studentRepo, new RedisOtpService());
// const loginUC = new LoginStudentUseCase(studentRepo); 
const generateOtpUC = new RedisOtpService();

// Final controller
export const studentAuthController = new StudentAuthController(
  registerStudentUC,
  generateOtpUC,
);
