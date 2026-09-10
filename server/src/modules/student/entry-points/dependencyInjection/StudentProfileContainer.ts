import { StudentProfileController } from '../controllers/StudentProfileController';
import { GetStudentProfileUseCase } from '../../application/use-cases/GetStudentProfileUseCase';
import { UpdateStudentProfileUseCase } from '../../application/use-cases/UpdateStudentProfileUseCase';
import { UploadStudentAvatarUseCase } from '../../application/use-cases/UploadStudentAvatarUseCase';
import { RemoveStudentAvatarUseCase } from '../../application/use-cases/RemoveStudentAvatarUseCase';
import { ChangeStudentPasswordUseCase } from '../../application/use-cases/ChangeStudentPasswordUseCase';
import { StudentRepository } from '../../infrastructure/repositories/StudentRepository';
import { CloudinaryStorageService } from '../../../../shared/services/file-upload/services/CloudinaryStorageService';
import { NodeMailerService } from '../../../../shared/services/mail/NodeMailerService';
import { passwordHasher } from '../../../../shared/services/password-hasher/BcryptPasswordHasher';

const studentRepository = new StudentRepository();
const storageService = new CloudinaryStorageService();
const nodeMailer = new NodeMailerService();

const getStudentProfileUseCase = new GetStudentProfileUseCase(
  studentRepository,
);
const updateStudentProfileUseCase = new UpdateStudentProfileUseCase(
  studentRepository,
);
const uploadStudentAvatarUseCase = new UploadStudentAvatarUseCase(
  studentRepository,
  storageService,
);
const removeStudentAvatarUseCase = new RemoveStudentAvatarUseCase(
  studentRepository,
  storageService,
);
const changeStudentPasswordUseCase = new ChangeStudentPasswordUseCase(
  studentRepository,
  passwordHasher,
  nodeMailer,
);

export const studentProfileController = new StudentProfileController(
  getStudentProfileUseCase,
  updateStudentProfileUseCase,
  uploadStudentAvatarUseCase,
  removeStudentAvatarUseCase,
  changeStudentPasswordUseCase,
);
