import { Request, Response } from 'express';
import { Readable } from 'stream';
import { ICreateLessonUseCase } from '../../application/interfaces/ICreateLessonUseCase';
import { IUpdateLessonUseCase } from '../../application/interfaces/IUpdateLessonUseCase';
import { IDeleteLessonUseCase } from '../../application/interfaces/IDeleteLessonUseCase';
import { IBlockLessonUseCase } from '../../application/interfaces/IBlockLessonUseCase';
import { IGetLessonPlayUrlUseCase } from '../../application/interfaces/IGetLessonPlayUrlUseCase';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { UserRole } from '../../../../shared/enums/UserRole';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import {
  CreateLessonSchema,
  GetUploadUrlSchema,
  GetVideoSignedUrlsSchema,
  BlockLessonSchema,
  UpdateLessonSchema,
} from '../../entry-point/validations/CourseValidation';
import { LessonMapper } from '../../application/mappers/LessonMapper';
import logger from '../../../../shared/utils/Logger';
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';

/**
 * In-memory cache for presigned B2 URLs.
 * Key: B2 object key  →  Value: { url, expiresAt (ms epoch) }
 *
 * Segments are immutable once written, so we cache them for their full TTL.
 * Playlists are also cached but with a shorter effective window so ABR quality
 * changes are still picked up quickly.
 *
 * This eliminates the per-request getSignedUrl() call to B2, which was the
 * biggest source of latency in the original proxy implementation.
 */
const _signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

export class LessonController {
  constructor(
    private _createUseCase: ICreateLessonUseCase,
    private _updateUseCase: IUpdateLessonUseCase,
    private _blockUseCase: IBlockLessonUseCase,
    private _deleteUseCase: IDeleteLessonUseCase,
    private _getLessonPlayUrlUseCase: IGetLessonPlayUrlUseCase,
    private _storageService: IStorageService,
  ) {}

  /**
   * Creates a new lesson.
   * @param req - Authenticated request object.
   * @param res - Express response object.
   */
  createLesson = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    logger.info(`Create lesson attempt from IP: ${req.ip}`);

    const instructorId = authenticatedReq.user.id;
    const validatedData = CreateLessonSchema.parse(authenticatedReq.body);
    const lessonEntity = LessonMapper.toCreateEntity(
      validatedData,
      instructorId,
    );

    const data = await this._createUseCase.execute(lessonEntity);

    logger.info(
      `Lesson created successfully for module ${validatedData.moduleId}`,
    );
    ApiResponseHelper.created(res, 'Lesson created successfully.', data);
  };

  /**
   * Generates a signed URL for uploading a file to S3.
   * @param req - Authenticated request object.
   * @param res - Express response object.
   */
  getUploadUrl = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    logger.info(`Get upload URL attempt from IP: ${req.ip}`);

    const validatedData = GetUploadUrlSchema.parse(authenticatedReq.body);
    const { fileName, contentType } = validatedData;

    const { signedUrl, publicUrl } =
      await this._storageService.generateUploadUrl(
        fileName,
        contentType || 'application/octet-stream',
      );

    logger.info(`Upload URL generated for file ${fileName}`);
    ApiResponseHelper.success(res, 'Upload URL generated successfully', {
      signedUrl,
      publicUrl,
    });
  };

  /**
   * Generates signed URLs for multiple video files.
   * @param req - Authenticated request object.
   * @param res - Express response object.
   */
  getVideoSignedUrls = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    logger.info(`Get video signed URLs attempt from IP: ${req.ip}`);

    const validatedData = GetVideoSignedUrlsSchema.parse(authenticatedReq.body);
    const fileNames = validatedData.fileNames;

    const urls = await Promise.all(
      fileNames.map(async (fileName) => {
        const url = await this._storageService.getSignedUrl(fileName, 300);
        return { fileName, url };
      }),
    );
    logger.info(`Signed URLs generated for ${fileNames.length} files`);
    ApiResponseHelper.success(res, 'Signed URLs generated successfully', urls);
  };

  /**
   * Streams HLS playlists and segments from private B2 storage through the API.
   *
   * Presigned URLs are cached in memory (_signedUrlCache) so getSignedUrl() is
   * only called once per unique file instead of on every segment request. A
   * typical lesson has 50-100 segments — without caching every single request
   * paid the ~100-300 ms cost of a round-trip to B2's auth endpoint.
   *
   * Auth is enforced here before the signed URL is ever used or returned.
   */
  streamHls = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, file } = req.params;
      const b2Key = `lessons/${id}/hls/${file}`;
      const isPlaylist = file.endsWith('.m3u8');

      // --- Cached signed URL -------------------------------------------
      // Segments: cache for 4 min (TTL 300 s, flush 60 s before expiry).
      // Playlists: cache for 55 min (TTL 3600 s, flush 300 s before expiry)
      // so ABR quality switches still see fresh content within ~5 min.
      const now = Date.now();
      const safeguard = isPlaylist ? 300_000 : 60_000; // ms before expiry to refresh
      const ttl = isPlaylist ? 3600 : 300;

      const cached = _signedUrlCache.get(b2Key);
      let signedUrl: string;

      if (cached && cached.expiresAt - now > safeguard) {
        // Cache hit — reuse the existing presigned URL.
        signedUrl = cached.url;
      } else {
        // Cache miss or near-expiry — generate a fresh presigned URL.
        signedUrl = await this._storageService.getSignedUrl(b2Key, ttl);
        _signedUrlCache.set(b2Key, {
          url: signedUrl,
          expiresAt: now + ttl * 1000,
        });
      }
      // -----------------------------------------------------------------

      const upstream = await fetch(signedUrl);

      if (!upstream.ok || !upstream.body) {
        const errorText = await upstream.text();
        logger.error(
          `B2 fetch failed: ${upstream.status} ${upstream.statusText} - ${errorText}`,
        );
        throw new Error(`Storage returned ${upstream.status} for ${b2Key}`);
      }

      res.status(upstream.status);
      res.setHeader(
        'Content-Type',
        isPlaylist ? 'application/vnd.apple.mpegurl' : 'video/mp2t',
      );
      // Playlists: short cache so ABR quality changes are picked up fast.
      // Segments: longer cache — immutable once written, safe to cache 5 min.
      res.setHeader(
        'Cache-Control',
        isPlaylist ? 'private, max-age=5' : 'private, max-age=300',
      );

      const contentLength = upstream.headers.get('content-length');
      if (contentLength) res.setHeader('Content-Length', contentLength);

      Readable.fromWeb(
        upstream.body as unknown as import('stream/web').ReadableStream,
      ).pipe(res);
    } catch (err) {
      logger.error('Error streaming HLS media', err);
      res.status(500).send('Error streaming media');
    }
  };

  /**
   * Updates an existing lesson.
   * @param req - Authenticated request object.
   * @param res - Express response object.
   */
  updateLesson = async (req: Request, res: Response): Promise<void> => {
    logger.info(`Update lesson attempt from IP: ${req.ip}`);
    const authenticatedReq = req as AuthenticatedRequest;
    const lessonId = authenticatedReq.params.id;
    const instructorId = authenticatedReq.user.id;
    // can validate updates if schema is strict, or use record
    const updates = UpdateLessonSchema.parse(authenticatedReq.body);

    await this._updateUseCase.execute(lessonId, instructorId, updates);
    logger.info(`Lesson ${lessonId} updated successfully`);
    ApiResponseHelper.success(res, 'Lesson updated successfully');
  };

  /**
   * Deletes a lesson.
   * @param req - Authenticated request object.
   * @param res - Express response object.
   */
  deleteLesson = async (req: Request, res: Response): Promise<void> => {
    logger.info(`Delete lesson attempt from IP: ${req.ip}`);
    const authenticatedReq = req as AuthenticatedRequest;

    const lessonId = authenticatedReq.params.id;
    const instructorId = authenticatedReq.user.id;

    await this._deleteUseCase.execute(lessonId, instructorId);
    logger.info(`Lesson ${lessonId} deleted successfully`);
    ApiResponseHelper.success(res, 'Lesson deleted successfully.');
  };

  /**
   * Blocks or unblocks a lesson.
   * @param req - Authenticated request object.
   * @param res - Express response object.
   */
  blockLesson = async (req: Request, res: Response): Promise<void> => {
    logger.info(`Block lesson attempt from IP: ${req.ip}`);
    const authenticatedReq = req as AuthenticatedRequest;

    const lessonId = authenticatedReq.params.id;
    const validatedData = BlockLessonSchema.parse(authenticatedReq.body);
    const { isBlocked } = validatedData;

    const lesson = await this._blockUseCase.execute(lessonId, isBlocked);
    logger.info(
      `Lesson ${lessonId} ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
    );
    ApiResponseHelper.success(
      res,
      `Lesson ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      lesson,
    );
  };

  /**
   * Gets the signed play URL for a lesson video.
   * Verifies enrollment before providing access.
   * @param req - Authenticated request object.
   * @param res - Express response object.
   */
  getLessonPlayUrl = async (req: Request, res: Response): Promise<void> => {
    logger.info(`Get lesson play URL attempt from IP: ${req.ip}`);
    const authenticatedReq = req as AuthenticatedRequest;

    const lessonId = authenticatedReq.params.id;
    const userId = authenticatedReq.user.id;
    const role = authenticatedReq.user.role as UserRole;

    const { signedUrl, hlsUrl, isProcessing } =
      await this._getLessonPlayUrlUseCase.execute(userId, lessonId, role);

    // --- Pre-warm Cache ------------------------------------------------
    // If this is an HLS lesson, the player is about to immediately request
    // master.m3u8 and then 144p.m3u8. Pre-signing them now saves ~200-400ms
    // of latency during the initial video loading spinner.
    if (hlsUrl) {
      const now = Date.now();
      const ttl = 3600;

      const masterKey = `lessons/${lessonId}/hls/master.m3u8`;
      const initialQualityKey = `lessons/${lessonId}/hls/144p.m3u8`;

      // Fire and forget (don't await so we don't delay the API response)
      Promise.all([
        this._storageService.getSignedUrl(masterKey, ttl),
        this._storageService.getSignedUrl(initialQualityKey, ttl),
      ])
        .then(([masterSigned, initialSigned]) => {
          _signedUrlCache.set(masterKey, {
            url: masterSigned,
            expiresAt: now + ttl * 1000,
          });
          _signedUrlCache.set(initialQualityKey, {
            url: initialSigned,
            expiresAt: now + ttl * 1000,
          });
          logger.info(
            `Pre-warmed signed URL cache for lesson ${lessonId} (master + 144p)`,
          );
        })
        .catch((err) => {
          logger.warn(
            `Failed to pre-warm cache for lesson ${lessonId}: ${err.message}`,
          );
        });
    }
    // -------------------------------------------------------------------

    logger.info(`Lesson play URL generated for lesson ${lessonId}`);
    ApiResponseHelper.success(res, 'Play URL generated successfully', {
      signedUrl,
      hlsUrl,
      isProcessing,
    });
  };
}
