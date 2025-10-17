import { ModuleController} from "../controllers/ModuleController";

import { CreateModuleUseCase } from "../../application/use-cases/CreateModuleUseCase";
import {MongoCourseRepository} from "../../infrastructure/repositories/MongoCourseRepository";
import { MongoModuleRepository } from "../../infrastructure/repositories/MongoModuleRepository";
import { MongoLessonRepository } from "../../infrastructure/repositories/MongoLessonRepository";
import { UpdateModuleUseCase } from "../../application/use-cases/UpdateModuleUseCase";
import { DeleteModuleUseCase } from "../../application/use-cases/DeleteModuleUseCase";

const courseRepository = new MongoCourseRepository();
const moduleRepository = new MongoModuleRepository();
const lessonRepository = new MongoLessonRepository();

const createModuleUC = new CreateModuleUseCase(
  moduleRepository
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

export const moduleWithLessonController = new ModuleController(
  createModuleUC,
  courseRepository,
  updateModuleUseCase,
  deleteModuleUseCase
);
