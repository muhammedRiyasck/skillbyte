import { CourseController } from "../controllers/CourseController";
import { GetCourseDetailUseCase } from "../../application/use-cases/GetCourseDetailUseCase";
import { CreateBaseUseCase } from "../../application/use-cases/CreateBaseUseCase";

import { MongoCourseRepository } from "../../infrastructure/repositories/MongoCourseRepository";
import { MongoModuleRepository } from "../../infrastructure/repositories/MongoModuleRepository";
import { MongoLessonRepository } from "../../infrastructure/repositories/MongoLessonRepository";
import { MongoInstructorRepository } from "../../../instructor/infrastructure/repositories/MongoInstructorRepository";
import { EnrollmentRepository } from "../../../enrollment/infrastructure/repositories/EnrollmentRepository";
import { UpdateBaseUseCase } from "../../application/use-cases/UpdateBaseUseCase";
import { DeleteCourseUseCase } from "../../application/use-cases/DeleteCourseUseCase";
import { UpdateCourseStatusUseCase } from "../../application/use-cases/UpdateCourseStatusUseCase";
import { GetPaginatedCoursesUseCase } from "../../application/use-cases/GetPaginatedCoursesUseCase";

const courseRepository = new MongoCourseRepository();
const moduleRepository = new MongoModuleRepository();
const lessonRepository = new MongoLessonRepository();
const instructorRepository = new MongoInstructorRepository();
const enrollmentRepository = new EnrollmentRepository();

const createCourseUC = new CreateBaseUseCase(courseRepository);

const getCourseDetailsUC = new GetCourseDetailUseCase(
    courseRepository,
    moduleRepository,
    lessonRepository,
    instructorRepository,
);

const updateBaseUC = new UpdateBaseUseCase(courseRepository);

const updateCourseStatusUC = new UpdateCourseStatusUseCase(courseRepository, moduleRepository, lessonRepository);

const getPaginatedCoursesUC = new GetPaginatedCoursesUseCase(courseRepository);


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
  getPaginatedCoursesUC,
  enrollmentRepository
); 
