import { Readable } from 'stream';
import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';
import {
  IStreamInstructorResumeUseCase,
  StreamResumeResult,
} from '../interfaces/IStreamInstructorResumeUseCase';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import logger from '../../../../shared/utils/Logger';

export class StreamInstructorResumeUseCase
  implements IStreamInstructorResumeUseCase
{
  constructor(
    private readonly _instructorRepo: IInstructorRepository,
    private readonly _storageService: IStorageService,
  ) {}

  async execute(instructorId: string): Promise<StreamResumeResult> {
    const instructor = await this._instructorRepo.findById(instructorId);
    if (!instructor) {
      throw new HttpError(
        ERROR_MESSAGES.INSTRUCTOR_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    if (!instructor.resumeUrl) {
      throw new HttpError(
        ERROR_MESSAGES.RESUME_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    const fileKey = instructor.resumeUrl;
    const freshSignedUrl = await this._storageService.getSignedUrl(fileKey);
    const fileResponse = await fetch(freshSignedUrl);

    if (!fileResponse.ok || !fileResponse.body) {
      logger.error(
        `Failed to fetch resume from storage: ${fileResponse.status} ${fileResponse.statusText}`,
      );
      throw new HttpError(
        'Failed to fetch file from storage',
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    const contentType =
      fileResponse.headers.get('content-type') || 'application/pdf';
    const stream = Readable.fromWeb(
      fileResponse.body as unknown as import('stream/web').ReadableStream,
    );

    return {
      stream,
      contentType,
    };
  }
}
