import DurationConverter from '../../../../shared/utils/DurationConverter';
import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';
import { Course } from '../../domain/entities/Course';
import { IUpdateBaseUseCase } from '../interfaces/IUpdateBaseUseCase';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

/**
 * Use case for updating basic course information.
 * Handles the business logic for updating course details, including authorization checks and duration conversion.
 */
export class UpdateBaseUseCase implements IUpdateBaseUseCase {
  /**
   * Constructs a new UpdateBaseUseCase instance.
   * @param repo - The repository for course data operations.
   */
  constructor(private readonly _CourseRepo: ICourseRepository) {}

  /**
   * Executes the course update logic.
   * Validates the course exists and the instructor has permission, then updates the provided fields.
   * Converts duration if provided as a string.
   * @param courseId - The ID of the course to update.
   * @param instructorId - The ID of the instructor making the update.
   * @param data - The partial course data to update.
   * @returns A promise that resolves when the update is complete.
   * @throws HttpError with appropriate status code if validation fails or access is denied.
   */
  async execute(
    courseId: string,
    instructorId: string,
    data: Partial<Omit<Course, 'createdAt' | 'updatedAt' | 'courseId'>>,
  ): Promise<void> {
    // Find the course to ensure it exists
    const course = await this._CourseRepo.findById(courseId);
    if (!course) {
      throw new HttpError(ERROR_MESSAGES.COURSE_NOT_FOUND, HttpStatusCode.BAD_REQUEST);
    }

    // Check if the instructor owns the course
    if (course.instructorId !== instructorId) {
      throw new HttpError(ERROR_MESSAGES.UNAUTHORIZED, HttpStatusCode.FORBIDDEN);
    }

    // Prepare update data, handling duration conversion if needed
    const { duration, ...rest } = data;
    const updateData: Partial<Course> = rest;
    if (duration !== undefined) {
      if (typeof duration === 'string') {
        updateData.duration = DurationConverter(duration);
      } else {
        updateData.duration = duration;
      }
    }

    // Update the course base information
    await this._CourseRepo.updateBaseInfo(courseId, updateData);
  }
}
