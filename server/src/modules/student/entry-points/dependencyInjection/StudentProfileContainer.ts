import { StudentProfileController } from '../controllers/StudentProfileController';
import { GetStudentProfileUseCase } from '../../application/use-cases/GetStudentProfileUseCase';
import { UpdateStudentProfileUseCase } from '../../application/use-cases/UpdateStudentProfileUseCase';
import { StudentRepository } from '../../infrastructure/repositories/StudentRepository';
import { CloudinaryStorageService } from '../../../../shared/services/file-upload/services/CloudinaryStorageService';

const studentRepository = new StudentRepository();
const storageService = new CloudinaryStorageService();

const getStudentProfileUseCase = new GetStudentProfileUseCase(
  studentRepository,
);
const updateStudentProfileUseCase = new UpdateStudentProfileUseCase(
  studentRepository,
);

export const studentProfileController = new StudentProfileController(
  getStudentProfileUseCase,
  updateStudentProfileUseCase,
  storageService,
);
