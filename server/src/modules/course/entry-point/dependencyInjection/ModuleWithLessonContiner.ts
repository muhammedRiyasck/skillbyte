import { ModuleWithLessonController} from "../controllers/ModuleController";

import { CreateModuleWithLessonsUseCase } from "../../application/use-cases/CreateModuleWithLessonsUseCase";
import {MongoCourseRepository} from "../../infrastructure/repositories/MongoCourseRepository";
import { MongoModuleRepository } from "../../infrastructure/repositories/MongoModuleRepository";
import { MongoLessonRepository } from "../../infrastructure/repositories/MongoLessonRepository";
import { UpdateModuleUseCase } from "../../application/use-cases/UpdateModuleUseCase";
import { DeleteModuleUseCase } from "../../application/use-cases/DeleteModuleUseCase";

const courseRepository = new MongoCourseRepository();
const moduleRepository = new MongoModuleRepository();
const lessonRepository = new MongoLessonRepository();

const createModuleWithLessonsUC = new CreateModuleWithLessonsUseCase(
  moduleRepository,
  lessonRepository
);

const updateModuleUseCase = new UpdateModuleUseCase(
  moduleRepository,
  courseRepository
);

const deleteModuleUseCase = new DeleteModuleUseCase(
  moduleRepository,
  lessonRepository,
  courseRepository
);

export const moduleWithLessonController = new ModuleWithLessonController(
  createModuleWithLessonsUC,
  courseRepository,
  updateModuleUseCase,
  deleteModuleUseCase
);
