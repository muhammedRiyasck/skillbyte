import { AdminInstructorController } from '../controllers/AdminInstructorController';

import { ListInstructorsUseCase } from '../../application/use-cases/ListInstructorsUseCase';
import { ApproveInstructorUseCase } from '../../application/use-cases/ApproveInstructorUseCase';
import { DeclineInstructorUseCase } from '../../application/use-cases/DeclineInstructorUseCase';

import { InstructorRepository } from '../../infrastructure/repositories/InstructorRepository';
import { ChangeInstructorStatusUseCase } from '../../application/use-cases/ChangeInstructorStatusUseCase';
import { DeleteInstructorUseCase } from '../../application/use-cases/DeleteInstructorUseCase';
import { S3StorageService } from '../../../../shared/services/file-upload/services/S3StorageService';
const instructorRepo = new InstructorRepository();

const listInstructorUC = new ListInstructorsUseCase(instructorRepo);
const approveUC = new ApproveInstructorUseCase(instructorRepo);
const declineUC = new DeclineInstructorUseCase(instructorRepo);
const changeInstructorStatusUC = new ChangeInstructorStatusUseCase(
  instructorRepo,
);
const deleteInstructorUC = new DeleteInstructorUseCase(instructorRepo);
const storageService = new S3StorageService();

export const adminInstructorController = new AdminInstructorController(
  listInstructorUC,
  approveUC,
  declineUC,
  changeInstructorStatusUC,
  deleteInstructorUC,
  storageService,
);
