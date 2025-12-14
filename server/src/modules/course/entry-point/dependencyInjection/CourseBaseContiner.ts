import { CourseController } from "../controllers/CourseController";
import { GetCourseDetailUseCase } from "../../application/use-cases/GetCourseDetailUseCase";
import { CreateBaseUseCase } from "../../application/use-cases/CreateBaseUseCase";

import { CourseRepository } from "../../infrastructure/repositories/CourseRepository";
import { ModuleRepository } from "../../infrastructure/repositories/ModuleRepository";
import { LessonRepository } from "../../infrastructure/repositories/LessonRepository";
import { InstructorRepository } from "../../../instructor/infrastructure/repositories/InstructorRepository";
import { EnrollmentRepository } from "../../../enrollment/infrastructure/repositories/EnrollmentRepository";
import { UpdateBaseUseCase } from "../../application/use-cases/UpdateBaseUseCase";
import { DeleteCourseUseCase } from "../../application/use-cases/DeleteCourseUseCase";
import { UpdateCourseStatusUseCase } from "../../application/use-cases/UpdateCourseStatusUseCase";
import { GetPaginatedCoursesUseCase } from "../../application/use-cases/GetPaginatedCoursesUseCase";
import { GetCategories } from "../../application/use-cases/GetCategoriesUseCase";

const courseRepository = new CourseRepository();
const moduleRepository = new ModuleRepository();
const lessonRepository = new LessonRepository();
const instructorRepository = new InstructorRepository();
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

const getCategoriesUC = new GetCategories(courseRepository);


export const courseController = new CourseController(createCourseUC,
  getCourseDetailsUC,
  updateBaseUC,
  deleteCourseUC,
  updateCourseStatusUC,
  getPaginatedCoursesUC,
  enrollmentRepository,
  getCategoriesUC
); 
