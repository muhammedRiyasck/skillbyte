
import { LessonController } from "../controllers/LessonController";

import { CreateLessonUseCase } from "../../application/use-cases/CreateLessonUseCase";
import { UpdateLessonUseCase } from "../../application/use-cases/UpdateLessonUseCase";
import { DeleteLessonUseCase } from "../../application/use-cases/DeleteLessonUseCase";

import { MongoCourseRepository } from "../../infrastructure/repositories/MongoCourseRepository";
import { MongoModuleRepository } from "../../infrastructure/repositories/MongoModuleRepository";
import { MongoLessonRepository } from "../../infrastructure/repositories/MongoLessonRepository";

const moduleRepository = new MongoModuleRepository();
const courseRepository = new MongoCourseRepository();
const LessonRepo = new MongoLessonRepository();

const createLessonUC = new CreateLessonUseCase(
    courseRepository,
    moduleRepository,
    LessonRepo
    );

const updateLessonUC = new UpdateLessonUseCase(
    LessonRepo,
    moduleRepository,
    courseRepository
);

const deleteLessonUC = new DeleteLessonUseCase(
    LessonRepo,
    moduleRepository,
    courseRepository
);

export const lessonController = new LessonController(createLessonUC , updateLessonUC , deleteLessonUC);
