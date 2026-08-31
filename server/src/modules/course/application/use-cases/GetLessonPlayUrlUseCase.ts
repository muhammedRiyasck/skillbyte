import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';
import { ILessonRepository } from '../../domain/IRepositories/ILessonRepository';
import { IModuleRepository } from '../../domain/IRepositories/IModuleRepository';
import { IEnrollmentReadRepository } from '../../../enrollment/domain/IRepositories/IEnrollmentReadRepository';
import { IGetLessonPlayUrlUseCase } from '../interfaces/IGetLessonPlayUrlUseCase';
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';
import { UserRole } from '../../../../shared/enums/UserRole';

export class GetLessonPlayUrlUseCase implements IGetLessonPlayUrlUseCase {
  constructor(
    private _lessonRepo: ILessonRepository,
    private _moduleRepo: IModuleRepository,
    private _enrollmentRepo: IEnrollmentReadRepository,
    private _storageService: IStorageService,
  ) {}

  async execute(
    userId: string,
    lessonId: string,
    role: UserRole,
  ): Promise<{ isProcessing?: boolean; hlsUrl?: string; signedUrl?: string }> {
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

    if (role === UserRole.STUDENT) {
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

    if (lesson.isProcessing) {
      return { isProcessing: true };
    }

    if (lesson.hlsUrl) {
      const baseUrl = process.env.BASE_URL?.replace(/\/$/, '');
      if (!baseUrl) {
        throw new Error('BASE_URL must be configured to stream HLS media');
      }

      return {
        isProcessing: false,
        hlsUrl: `${baseUrl}/api/v1/course/lesson/${lessonId}/hls/master.m3u8`,
      };
    }

    const signedUrl = await this._storageService.getSignedUrl(lesson.fileName);
    return { isProcessing: false, signedUrl };
  }
}
