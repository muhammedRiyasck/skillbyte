
import { LessonController } from "../controllers/LessonController";

import { CreateLessonUseCase } from "../../application/use-cases/CreateLessonUseCase";
import { UpdateLessonUseCase } from "../../application/use-cases/UpdateLessonUseCase";
import { DeleteLessonUseCase } from "../../application/use-cases/DeleteLessonUseCase";
import { GetLessonPlayUrlUseCase } from "../../application/use-cases/GetLessonPlayUrlUseCase";

import { MongoCourseRepository } from "../../infrastructure/repositories/MongoCourseRepository";
import { MongoModuleRepository } from "../../infrastructure/repositories/MongoModuleRepository";
import { MongoLessonRepository } from "../../infrastructure/repositories/MongoLessonRepository";
import { EnrollmentRepository } from "../../../enrollment/infrastructure/repositories/EnrollmentRepository";
import { BlockLessonUseCase } from "../../application/use-cases/BlockLessonUseCase";

const moduleRepository = new MongoModuleRepository();
const courseRepository = new MongoCourseRepository();
const LessonRepo = new MongoLessonRepository();
const enrollmentRepository = new EnrollmentRepository();

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

const blockLessonUC = new BlockLessonUseCase(
    LessonRepo
);

const deleteLessonUC = new DeleteLessonUseCase(
    LessonRepo,
    moduleRepository,
    courseRepository
);

const getLessonPlayUrlUC = new GetLessonPlayUrlUseCase(
    LessonRepo,
    moduleRepository,
    enrollmentRepository
);

export const lessonController = new LessonController(createLessonUC , updateLessonUC , blockLessonUC, deleteLessonUC, getLessonPlayUrlUC);
