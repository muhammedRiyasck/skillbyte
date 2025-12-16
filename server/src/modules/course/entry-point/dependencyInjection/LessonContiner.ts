import { LessonController } from '../controllers/LessonController';

import { CreateLessonUseCase } from '../../application/use-cases/CreateLessonUseCase';
import { UpdateLessonUseCase } from '../../application/use-cases/UpdateLessonUseCase';
import { DeleteLessonUseCase } from '../../application/use-cases/DeleteLessonUseCase';
import { GetLessonPlayUrlUseCase } from '../../application/use-cases/GetLessonPlayUrlUseCase';

import { CourseRepository } from '../../infrastructure/repositories/CourseRepository';
import { ModuleRepository } from '../../infrastructure/repositories/ModuleRepository';
import { LessonRepository } from '../../infrastructure/repositories/LessonRepository';
import { EnrollmentRepository } from '../../../enrollment/infrastructure/repositories/EnrollmentRepository';
import { BlockLessonUseCase } from '../../application/use-cases/BlockLessonUseCase';

const moduleRepository = new ModuleRepository();
const courseRepository = new CourseRepository();
const LessonRepo = new LessonRepository();
const enrollmentRepository = new EnrollmentRepository();

const createLessonUC = new CreateLessonUseCase(
  courseRepository,
  moduleRepository,
  LessonRepo,
);

const updateLessonUC = new UpdateLessonUseCase(
  LessonRepo,
  moduleRepository,
  courseRepository,
);

const blockLessonUC = new BlockLessonUseCase(LessonRepo);

const deleteLessonUC = new DeleteLessonUseCase(
  LessonRepo,
  moduleRepository,
  courseRepository,
);

const getLessonPlayUrlUC = new GetLessonPlayUrlUseCase(
  LessonRepo,
  moduleRepository,
  enrollmentRepository,
);

export const lessonController = new LessonController(
  createLessonUC,
  updateLessonUC,
  blockLessonUC,
  deleteLessonUC,
  getLessonPlayUrlUC,
);
