import { ILessonRepository } from '../../domain/IRepositories/ILessonRepository';
import { IModuleRepository } from '../../domain/IRepositories/IModuleRepository';
import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';
import { IDeleteLessonUseCase } from '../interfaces/IDeleteLessonUseCase';
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

/** Executes the business logic for delete lesson. */
export class DeleteLessonUseCase implements IDeleteLessonUseCase {
  /**
   * Constructs a new DeleteLessonUseCase instance.
   * @param lessonRepo - The repository for lesson data operations.
   * @param moduleRepo - The repository for module data operations.
   * @param courseRepo - The repository for course data operations.
   */
  constructor(
    private _lessonRepo: ILessonRepository,
    private _moduleRepo: IModuleRepository,
    private _courseRepo: ICourseRepository,
    private _storageService: IStorageService,
  ) {}

  /**
   * Execute for the DeleteLesson entity.
   *
   * @param lessonId - The unique identifier for the lesson.
   * @param instructorId - The unique identifier for the instructor.
   */
  async execute(lessonId: string, instructorId: string): Promise<void> {
    // Find the lesson to ensure it exists
    const lesson = await this._lessonRepo.findById(lessonId);
    if (!lesson) {
      throw new HttpError(
        ERROR_MESSAGES.LESSON_NOT_FOUND,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // Find the associated module to ensure it exists
    const module = await this._moduleRepo.findById(lesson.moduleId.toString());
    if (!module) {
      throw new HttpError(
        ERROR_MESSAGES.MODULE_NOT_FOUND,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // Find the associated course and verify instructor ownership
    const course = await this._courseRepo.findById(module.courseId);
    if (!course || course.instructorId !== instructorId) {
      throw new HttpError(
        ERROR_MESSAGES.UNAUTHORIZED_DELETE_LESSON,
        HttpStatusCode.FORBIDDEN,
      );
    }

    await this._lessonRepo.deleteById(lessonId);

    // Fire-and-forget cloud cleanup — does NOT block the HTTP response
    // Only delete the video file; resources are external links (not cloud-stored)
    if (lesson.fileName) {
      this._storageService.delete(lesson.fileName).catch((error) => {
        console.error(`Cloud cleanup failed for lesson ${lessonId}:`, error);
      });
    }

    // Also clean up all generated HLS segments and playlists for this lesson
    const hlsPrefix = `lessons/${lessonId}/hls`;
    this._storageService.deleteFolder(hlsPrefix).catch((error) => {
      console.error(`HLS folder cleanup failed for lesson ${lessonId}:`, error);
    });
  }
}
