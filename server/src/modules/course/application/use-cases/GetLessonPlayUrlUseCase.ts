import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';
import { ILessonRepository } from '../../domain/IRepositories/ILessonRepository';
import { IModuleRepository } from '../../domain/IRepositories/IModuleRepository';
import { IEnrollmentReadRepository } from '../../../enrollment/domain/IRepositories/IEnrollmentReadRepository';
import { IGetLessonPlayUrlUseCase } from '../interfaces/IGetLessonPlayUrlUseCase';
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';
import { IStreamLessonHlsUseCase } from '../interfaces/IStreamLessonHlsUseCase';
import { UserRole } from '../../../../shared/enums/UserRole';

/** Executes the business logic for get lesson play url. */
export class GetLessonPlayUrlUseCase implements IGetLessonPlayUrlUseCase {
  constructor(
    private _lessonRepo: ILessonRepository,
    private _moduleRepo: IModuleRepository,
    private _enrollmentRepo: IEnrollmentReadRepository,
    private _storageService: IStorageService,
    private _streamHlsUseCase?: IStreamLessonHlsUseCase,
  ) {}

  /**
   * Execute for the GetLessonPlayUrl entity.
   *
   * @param userId - The unique identifier for the user.
   * @param lessonId - The unique identifier for the lesson.
   * @param role - The role information.
   * @returns The result of the operation.
   */
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
      const signedUrl = await this._storageService.getSignedUrl(
        lesson.fileName,
      );
      return { isProcessing: true, signedUrl };
    }

    if (lesson.hlsUrl) {
      // Pre-warm cache for master and 144p segments
      if (this._streamHlsUseCase) {
        this._streamHlsUseCase.prewarm(lessonId);
      }

      const baseUrl = process.env.BASE_URL?.replace(/\/$/, '') || '';
      return {
        isProcessing: false,
        hlsUrl: `${baseUrl}/api/v1/course/lesson/${lessonId}/hls/master.m3u8`,
      };
    }

    const signedUrl = await this._storageService.getSignedUrl(lesson.fileName);
    return { isProcessing: false, signedUrl };
  }
}
