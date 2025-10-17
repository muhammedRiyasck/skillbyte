import { Course } from "../../domain/entities/Course";
import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";
import { IGetAllCoursesForAdminUseCase } from "../interfaces/IGetAllCoursesForAdminUseCase";

/**
 * Filters for retrieving courses for admin.
 */
type CourseFilters = {
  instructorId?: string;
  status?: string;
  category?: string;
  search?: string;
};

/**
 * Use case for retrieving all courses for admin with optional filters.
 * Handles the business logic for fetching courses with filtering capabilities for administrative purposes.
 */
export class GetAllCoursesForAdminUseCase implements IGetAllCoursesForAdminUseCase {
  /**
   * Constructs a new GetAllCoursesForAdminUseCase instance.
   * @param courseRepo - The repository for course data operations.
   */
  constructor(private courseRepo: ICourseRepository) {}

  /**
   * Executes the course retrieval logic for admin.
   * Applies optional filters to fetch courses from the repository.
   * @param filters - Optional filters to apply to the course query (instructorId, status, category, search).
   * @returns A promise that resolves to an array of Course entities matching the filters.
   */
  async execute(filters: CourseFilters): Promise<Course[]> {
    // Retrieve all courses for admin with applied filters
    return await this.courseRepo.findAllForAdmin(filters);
  }
}
