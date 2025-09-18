import { CourseController } from "../controllers/CourseController";
import { GetCourseDetailsUseCase } from "../../application/use-cases/GetCourseDetailsUseCase";
import { CreateBaseUseCase } from "../../application/use-cases/CreateBaseUseCase";

import { MongoCourseRepository } from "../../infrastructure/repositories/MongoCourseRepository";
import { MongoModuleRepository } from "../../infrastructure/repositories/MongoModuleRepository";
import { MongoLessonRepository } from "../../infrastructure/repositories/MongoLessonRepository";
import { UpdateBaseUseCase } from "../../application/use-cases/UpdateBaseUseCase";
import { DeleteCourseUseCase } from "../../application/use-cases/DeleteCourseUseCase";
import { UpdateCourseStatusUseCase } from "../../application/use-cases/UpdateCourseStatusUseCase";
import { GetPublishedCoursesUseCase } from "../../application/use-cases/GetPublishedCoursesUseCase";
import { GetInstructorCoursesUseCase } from "../../application/use-cases/GetInstructorCoursesUseCase";
import { GetAllCoursesForAdminUseCase } from "../../application/use-cases/GetAllCoursesForAdminUseCase";

const courseRepository = new MongoCourseRepository();
const moduleRepository = new MongoModuleRepository();
const lessonRepository = new MongoLessonRepository();

const createCourseUC = new CreateBaseUseCase(courseRepository);

const getCourseDetailsUC = new GetCourseDetailsUseCase(
   courseRepository,
    moduleRepository,
    lessonRepository
);

const updateBaseUC = new UpdateBaseUseCase(courseRepository);

const updateCourseStatusUC = new UpdateCourseStatusUseCase(courseRepository)

const getPublishedCoursesUC = new GetPublishedCoursesUseCase(courseRepository);

const getInstructorCoursesUC = new GetInstructorCoursesUseCase(courseRepository);

const getAllCoursesForAdminUC = new GetAllCoursesForAdminUseCase(courseRepository);

const deleteCourseUC = new DeleteCourseUseCase(
    courseRepository,
    moduleRepository,
    lessonRepository
);


export const courseController = new CourseController(createCourseUC,
  getCourseDetailsUC,
  updateBaseUC,
  deleteCourseUC,
  updateCourseStatusUC,
  getPublishedCoursesUC,
  getInstructorCoursesUC,
  getAllCoursesForAdminUC
); 
