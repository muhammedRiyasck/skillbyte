import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';
import { ILessonRepository } from '../../domain/IRepositories/ILessonRepository';
import { IModuleRepository } from '../../domain/IRepositories/IModuleRepository';
import { IEnrollmentRepository } from '../../../enrollment/domain/IEnrollmentRepository';
import { IGetLessonPlayUrlUseCase } from '../interfaces/IGetLessonPlayUrlUseCase';
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';

export class GetLessonPlayUrlUseCase implements IGetLessonPlayUrlUseCase {
  constructor(
    private _lessonRepo: ILessonRepository,
    private _moduleRepo: IModuleRepository,
    private _enrollmentRepo: IEnrollmentRepository,
    private _storageService: IStorageService,
  ) {}

  async execute(
    userId: string,
    lessonId: string,
    role: string,
  ): Promise<{ signedUrl: string }> {
    const lesson = await this._lessonRepo.findById(lessonId);
    if (!lesson) {
      throw new HttpError(
        ERROR_MESSAGES.LESSON_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    if (!lesson.fileName) {
      throw new HttpError('Lesson video not found', HttpStatusCode.NOT_FOUND);
    }

    if (role === 'student') {
      const module = await this._moduleRepo.findById(lesson.moduleId);
      if (!module) {
        throw new HttpError(
          ERROR_MESSAGES.MODULE_NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
        );
      }

      if (lesson.isFreePreview) {
        if (lesson.isBlocked) {
          throw new HttpError(
            'This lesson is currently unavailable.',
            HttpStatusCode.FORBIDDEN,
          );
        }
      } else {
        const isEnrolled = await this._enrollmentRepo.findEnrollment(
          userId,
          module.courseId,
        );
        if (!isEnrolled) {
          throw new HttpError(
            'You must be enrolled to watch this lesson.',
            HttpStatusCode.FORBIDDEN,
          );
        }

        if (lesson.isBlocked) {
          throw new HttpError(
            'This lesson is currently unavailable.',
            HttpStatusCode.FORBIDDEN,
          );
        }
      }
    }

    const signedUrl = await this._storageService.getSignedUrl(lesson.fileName);
    return { signedUrl };
  }
}
