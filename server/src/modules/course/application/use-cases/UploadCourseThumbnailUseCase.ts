import fs from 'fs/promises';
import {
  IUploadCourseThumbnailUseCase,
  UploadThumbnailInput,
} from '../interfaces/IUploadCourseThumbnailUseCase';
import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import logger from '../../../../shared/utils/Logger';

const MAX_THUMBNAIL_SIZE = 2 * 1024 * 1024; // 2MB

export class UploadCourseThumbnailUseCase
  implements IUploadCourseThumbnailUseCase
{
  constructor(
    private readonly _courseRepo: ICourseRepository,
    private readonly _storageService: IStorageService,
  ) {}

  async execute(
    input: UploadThumbnailInput,
  ): Promise<{ id: string; thumbnailUrl: string }> {
    const { courseId, instructorId, filePath, mimeType, fileSize } = input;

    if (!courseId) {
      throw new HttpError(
        ERROR_MESSAGES.CANT_SEE_COURSEID,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    if (!filePath) {
      throw new HttpError(
        ERROR_MESSAGES.NO_FILE_UPLOADED,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    if (fileSize > MAX_THUMBNAIL_SIZE) {
      logger.warn('Thumbnail size exceeds 2MB');
      throw new HttpError(
        ERROR_MESSAGES.THUMBNAIL_SIZE_EXCEEDED,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    if (!mimeType.startsWith('image/')) {
      throw new HttpError(
        ERROR_MESSAGES.ONLY_IMAGE_FILES_ALLOWED,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const course = await this._courseRepo.findById(courseId);
    if (!course) {
      throw new HttpError(
        ERROR_MESSAGES.COURSE_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    if (course.instructorId !== instructorId) {
      throw new HttpError(
        ERROR_MESSAGES.UNAUTHORIZED,
        HttpStatusCode.FORBIDDEN,
      );
    }

    let url: string;
    try {
      url = await this._storageService.upload(filePath, {
        folder: 'skillbyte/thumbnails',
        resourceType: 'image',
        publicId: `thumbnail_${courseId}`,
        overwrite: true,
      });

      await this._courseRepo.updateBaseInfo(courseId, {
        thumbnailUrl: url,
      });
    } finally {
      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        logger.error('Error deleting local file:', unlinkError);
      }
    }

    return { id: courseId, thumbnailUrl: url };
  }
}
