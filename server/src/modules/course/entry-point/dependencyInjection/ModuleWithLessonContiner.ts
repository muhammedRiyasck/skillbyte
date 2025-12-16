import { ModuleController } from '../controllers/ModuleController';

import { CreateModuleUseCase } from '../../application/use-cases/CreateModuleUseCase';
import { CourseRepository } from '../../infrastructure/repositories/CourseRepository';
import { ModuleRepository } from '../../infrastructure/repositories/ModuleRepository';
import { LessonRepository } from '../../infrastructure/repositories/LessonRepository';
import { UpdateModuleUseCase } from '../../application/use-cases/UpdateModuleUseCase';
import { DeleteModuleUseCase } from '../../application/use-cases/DeleteModuleUseCase';

const courseRepository = new CourseRepository();
const moduleRepository = new ModuleRepository();
const lessonRepository = new LessonRepository();

const createModuleUC = new CreateModuleUseCase(moduleRepository);

const updateModuleUseCase = new UpdateModuleUseCase(
  moduleRepository,
  courseRepository,
);

const deleteModuleUseCase = new DeleteModuleUseCase(
  moduleRepository,
  lessonRepository,
  courseRepository,
);

export const moduleWithLessonController = new ModuleController(
  createModuleUC,
  courseRepository,
  updateModuleUseCase,
  deleteModuleUseCase,
);
