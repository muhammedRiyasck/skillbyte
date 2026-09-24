import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';
import { IUpdateBaseUseCase } from '../interfaces/IUpdateBaseUseCase';
import { CourseMapper } from '../mappers/CourseMapper';
import { UpdateBaseValidationType } from '../dtos/CourseDetailsDtos';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

/** Executes the business logic for update base. */
export class UpdateBaseUseCase implements IUpdateBaseUseCase {
  /**
   * Constructs a new UpdateBaseUseCase instance.
   * @param repo - The repository for course data operations.
   */
  constructor(private readonly _CourseRepo: ICourseRepository) {}

  /**
   * Execute for the UpdateBase entity.
   *
   * @param courseId - The unique identifier for the course.
   * @param instructorId - The unique identifier for the instructor.
   * @param validatedData - The unique identifier for the validatedData.
   */
  async execute(
    courseId: string,
    instructorId: string,
    validatedData: UpdateBaseValidationType,
  ): Promise<void> {
    const data = CourseMapper.toUpdateDto(validatedData);

    // Find the course to ensure it exists
    const course = await this._CourseRepo.findById(courseId);
    if (!course) {
      throw new HttpError(
        ERROR_MESSAGES.COURSE_NOT_FOUND,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    if (course.instructorId !== instructorId) {
      throw new HttpError(
        ERROR_MESSAGES.UNAUTHORIZED,
        HttpStatusCode.FORBIDDEN,
      );
    }

    await this._CourseRepo.updateBaseInfo(courseId, data);
  }
}
