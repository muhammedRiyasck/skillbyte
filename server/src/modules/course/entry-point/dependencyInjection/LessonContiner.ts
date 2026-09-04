import { LessonController } from '../controllers/LessonController';

import { CreateLessonUseCase } from '../../application/use-cases/CreateLessonUseCase';
import { UpdateLessonUseCase } from '../../application/use-cases/UpdateLessonUseCase';
import { DeleteLessonUseCase } from '../../application/use-cases/DeleteLessonUseCase';
import { GetLessonPlayUrlUseCase } from '../../application/use-cases/GetLessonPlayUrlUseCase';
import { GetUploadUrlUseCase } from '../../application/use-cases/GetUploadUrlUseCase';
import { GetVideoSignedUrlsUseCase } from '../../application/use-cases/GetVideoSignedUrlsUseCase';
import { StreamLessonHlsUseCase } from '../../application/use-cases/StreamLessonHlsUseCase';

import { CourseRepository } from '../../infrastructure/repositories/CourseRepository';
import { ModuleRepository } from '../../infrastructure/repositories/ModuleRepository';
import { LessonRepository } from '../../infrastructure/repositories/LessonRepository';
import { EnrollmentReadRepository } from '../../../enrollment/infrastructure/repositories/EnrollmentReadRepository';
import { BlockLessonUseCase } from '../../application/use-cases/BlockLessonUseCase';
import { S3StorageService } from '../../../../shared/services/file-upload/services/S3StorageService';

const moduleRepository = new ModuleRepository();
const courseRepository = new CourseRepository();
const LessonRepo = new LessonRepository();
const enrollmentRepository = new EnrollmentReadRepository();
const storageService = new S3StorageService();

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
  storageService,
);

const streamHlsUC = new StreamLessonHlsUseCase(storageService);

const getLessonPlayUrlUC = new GetLessonPlayUrlUseCase(
  LessonRepo,
  moduleRepository,
  enrollmentRepository,
  storageService,
  streamHlsUC,
);

const getUploadUrlUC = new GetUploadUrlUseCase(storageService);
const getVideoSignedUrlsUC = new GetVideoSignedUrlsUseCase(storageService);

export const lessonController = new LessonController(
  createLessonUC,
  updateLessonUC,
  blockLessonUC,
  deleteLessonUC,
  getLessonPlayUrlUC,
  getUploadUrlUC,
  getVideoSignedUrlsUC,
  streamHlsUC,
);
