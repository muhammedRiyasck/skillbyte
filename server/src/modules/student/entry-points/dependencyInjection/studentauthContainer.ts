import { StudentAuthController } from "../controllers/StudentAuthController";

import { RegisterStudentUseCase } from "../../application/use-cases/RegisterStudentUseCase";
import { LoginStudentUseCase } from "../../application/use-cases/LoginStudentUseCase";
import { RedisOtpService } from "../../../../shared/services/otp/OtpService";

import { MongoStudentRepository } from "../../infrastructure/repositories/MongoStudentRepository";

// Instantiate services
const studentRepo = new MongoStudentRepository();

// Instantiate use cases
const registerStudentUC = new RegisterStudentUseCase(studentRepo, new RedisOtpService());

// const loginUC = new LoginStudentUseCase(studentRepo); 
const generateOtpUC = new RedisOtpService();

// Final controller
export const studentAuthController = new StudentAuthController(
  registerStudentUC,
  generateOtpUC,
);
