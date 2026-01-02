import { InstructorProfileController } from '../controllers/InstructorProfileController';
import { GetInstructorProfileUseCase } from '../../application/use-cases/GetInstructorProfileUseCase';
import { UpdateInstructorProfileUseCase } from '../../application/use-cases/UpdateInstructorProfileUseCase';
import { InstructorRepository } from '../../infrastructure/repositories/InstructorRepository';
import { CloudinaryStorageService } from '../../../../shared/services/file-upload/services/CloudinaryStorageService';

const instructorRepository = new InstructorRepository();
const storageService = new CloudinaryStorageService();

const getInstructorProfileUseCase = new GetInstructorProfileUseCase(
  instructorRepository,
);
const updateInstructorProfileUseCase = new UpdateInstructorProfileUseCase(
  instructorRepository,
);

export const instructorProfileController = new InstructorProfileController(
  getInstructorProfileUseCase,
  updateInstructorProfileUseCase,
  storageService,
);
