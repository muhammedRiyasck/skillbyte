import { InstructorProfileController } from "../controllers/InstructorProfileController";
import { GetInstructorProfileUseCase } from "../../application/use-cases/GetInstructorProfileUseCase";
import { UpdateInstructorProfileUseCase } from "../../application/use-cases/UpdateInstructorProfileUseCase";
import { MongoInstructorRepository } from "../../infrastructure/repositories/MongoInstructorRepository";

const instructorRepository = new MongoInstructorRepository();
const getInstructorProfileUseCase = new GetInstructorProfileUseCase(instructorRepository);
const updateInstructorProfileUseCase = new UpdateInstructorProfileUseCase(instructorRepository);

export const instructorProfileController = new InstructorProfileController(
  getInstructorProfileUseCase,
  updateInstructorProfileUseCase
);
