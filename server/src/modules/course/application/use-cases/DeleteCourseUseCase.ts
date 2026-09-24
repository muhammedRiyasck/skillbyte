import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';
import { ILessonRepository } from '../../domain/IRepositories/ILessonRepository';
import { IModuleRepository } from '../../domain/IRepositories/IModuleRepository';
import { IDeleteCourseUseCase } from '../interfaces/IDeleteCourseUseCase';
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

/** Executes the business logic for delete course. */
export class DeleteCourseUseCase implements IDeleteCourseUseCase {
  /**
   * Constructs a new DeleteCourseUseCase instance.
   * @param courseRepo - The repository for course data operations.
   * @param moduleRepo - The repository for module data operations.
   * @param lessonRepo - The repository for lesson data operations.
   */
  constructor(
    private _courseRepo: ICourseRepository,
    private _moduleRepo: IModuleRepository,
    private _lessonRepo: ILessonRepository,
    private _storageService: IStorageService,
  ) {}

  /**
   * Execute for the DeleteCourse entity.
   *
   * @param courseId - The unique identifier for the course.
   * @param instructorId - The unique identifier for the instructor.
   */
  async execute(courseId: string, instructorId: string): Promise<void> {
    // Find the course to ensure it exists
    const course = await this._courseRepo.findById(courseId);
    if (!course) {
      throw new HttpError(
        ERROR_MESSAGES.COURSE_NOT_FOUND,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // Verify the instructor owns the course
    if (course.instructorId !== instructorId) {
      throw new HttpError(
        ERROR_MESSAGES.UNAUTHORIZED,
        HttpStatusCode.FORBIDDEN,
      );
    }

    // Retrieve all modules associated with the course
    const modules = await this._moduleRepo.findModulesByCourseId(courseId);
    const moduleIds = modules
      .map((m) => m.moduleId)
      .filter((id): id is string => typeof id === 'string');

    await this._lessonRepo.deleteManyByModuleIds(moduleIds);

    await this._moduleRepo.deleteManyByCourseId(courseId);

    if (course.thumbnailUrl) {
      try {
        const thumbnailId = this._storageService.getIdentifierFromUrl(
          course.thumbnailUrl,
        );
        await this._storageService.delete(thumbnailId);
      } catch (error) {
        console.error(
          `Failed to delete cloud thumbnail for course ${courseId}:`,
          error,
        );
      }
    }

    // Finally, delete the course itself
    await this._courseRepo.deleteById(courseId);
  }
}
