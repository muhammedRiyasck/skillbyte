import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';
import { ILessonRepository } from '../../domain/IRepositories/ILessonRepository';
import { IModuleRepository } from '../../domain/IRepositories/IModuleRepository';
import { IDeleteModuleUseCase } from '../interfaces/IDeleteModuleUseCase';
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

/** Executes the business logic for delete module. */
export class DeleteModuleUseCase implements IDeleteModuleUseCase {
  /**
   * Constructs a new DeleteModuleUseCase instance.
   * @param moduleRepo - The repository for module data operations.
   * @param lessonRepo - The repository for lesson data operations.
   * @param courseRepo - The repository for course data operations.
   */
  constructor(
    private _moduleRepo: IModuleRepository,
    private _lessonRepo: ILessonRepository,
    private _courseRepo: ICourseRepository,
    private _storageService: IStorageService,
  ) {}

  /**
   * Execute for the DeleteModule entity.
   *
   * @param moduleId - The unique identifier for the module.
   * @param instructorId - The unique identifier for the instructor.
   */
  async execute(moduleId: string, instructorId: string): Promise<void> {
    // Find the module to ensure it exists
    const module = await this._moduleRepo.findById(moduleId);
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
        ERROR_MESSAGES.UNAUTHORIZED_DELETE_MODULE,
        HttpStatusCode.FORBIDDEN,
      );
    }

    const lessons = await this._lessonRepo.findByModuleId([moduleId]);

    await this._lessonRepo.deleteManyByModuleId(moduleId);
    await this._moduleRepo.deleteById(moduleId);

    // Fire-and-forget cloud cleanup — runs in background after response is sent
    // Only delete video files; resources are external links (not cloud-stored)
    const cleanupTasks: Promise<void>[] = [];
    for (const lesson of lessons) {
      if (lesson.fileName) {
        cleanupTasks.push(this._storageService.delete(lesson.fileName));
      }
    }

    Promise.allSettled(cleanupTasks).then((results) => {
      results.forEach((result, i) => {
        if (result.status === 'rejected') {
          console.error(
            `Cloud cleanup task ${i} failed for module ${moduleId}:`,
            result.reason,
          );
        }
      });
    });
  }
}
