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
    logger.info('[StreamResume] Request to stream resume', { instructorId });

    // ── 1. Fetch instructor ────────────────────────────────────────────────
    const instructor = await this._instructorRepo.findById(instructorId);
    if (!instructor) {
      logger.error('[StreamResume] Instructor not found in DB', { instructorId });
      throw new HttpError(
        ERROR_MESSAGES.INSTRUCTOR_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    logger.info('[StreamResume] Instructor found', {
      instructorId,
      email: instructor.email,
      resumeUrl: instructor.resumeUrl ?? 'null',
    });

    // ── 2. Check resume key ────────────────────────────────────────────────
    if (!instructor.resumeUrl) {
      logger.warn(
        '[StreamResume] resumeUrl is null/undefined — resume was never uploaded or upload failed',
        { instructorId, email: instructor.email },
      );
      throw new HttpError(
        ERROR_MESSAGES.RESUME_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    const fileKey = instructor.resumeUrl;
    logger.info('[StreamResume] Generating signed URL', { instructorId, fileKey });

    // ── 3. Generate signed URL ─────────────────────────────────────────────
    let freshSignedUrl: string;
    try {
      freshSignedUrl = await this._storageService.getSignedUrl(fileKey);
      logger.info('[StreamResume] Signed URL generated', {
        instructorId,
        fileKey,
        // log only the beginning so the full URL doesn't fill logs
        signedUrlPreview: freshSignedUrl.substring(0, 80) + '...',
      });
    } catch (err) {
      logger.error('[StreamResume] Failed to generate signed URL', {
        instructorId,
        fileKey,
        error: (err as Error)?.message,
      });
      throw err;
    }

    // ── 4. Fetch file from storage ─────────────────────────────────────────
    logger.info('[StreamResume] Fetching file from signed URL', { instructorId, fileKey });
    const fileResponse = await fetch(freshSignedUrl);

    logger.info('[StreamResume] Fetch response received', {
      instructorId,
      fileKey,
      status: fileResponse.status,
      statusText: fileResponse.statusText,
      contentType: fileResponse.headers.get('content-type'),
      contentLength: fileResponse.headers.get('content-length'),
    });

    if (!fileResponse.ok || !fileResponse.body) {
      logger.error('[StreamResume] Fetch from storage failed', {
        instructorId,
        fileKey,
        status: fileResponse.status,
        statusText: fileResponse.statusText,
      });
      throw new HttpError(
        'Failed to fetch file from storage',
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    const contentType =
      fileResponse.headers.get('content-type') || 'application/pdf';

    logger.info('[StreamResume] Streaming resume to client', {
      instructorId,
      fileKey,
      contentType,
    });

    const stream = Readable.fromWeb(
      fileResponse.body as unknown as import('stream/web').ReadableStream,
    );

    return { stream, contentType };
  }
}
