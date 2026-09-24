import { Request, Response } from 'express';
import { ICreateLessonUseCase } from '../../application/interfaces/ICreateLessonUseCase';
import { IUpdateLessonUseCase } from '../../application/interfaces/IUpdateLessonUseCase';
import { IDeleteLessonUseCase } from '../../application/interfaces/IDeleteLessonUseCase';
import { IBlockLessonUseCase } from '../../application/interfaces/IBlockLessonUseCase';
import { IGetLessonPlayUrlUseCase } from '../../application/interfaces/IGetLessonPlayUrlUseCase';
import { IGetUploadUrlUseCase } from '../../application/interfaces/IGetUploadUrlUseCase';
import { IGetVideoSignedUrlsUseCase } from '../../application/interfaces/IGetVideoSignedUrlsUseCase';
import { IStreamLessonHlsUseCase } from '../../application/interfaces/IStreamLessonHlsUseCase';
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
import logger from '../../../../shared/utils/Logger';

export class LessonController {
  constructor(
    private _createUseCase: ICreateLessonUseCase,
    private _updateUseCase: IUpdateLessonUseCase,
    private _blockUseCase: IBlockLessonUseCase,
    private _deleteUseCase: IDeleteLessonUseCase,
    private _getLessonPlayUrlUseCase: IGetLessonPlayUrlUseCase,
    private _getUploadUrlUseCase: IGetUploadUrlUseCase,
    private _getVideoSignedUrlsUseCase: IGetVideoSignedUrlsUseCase,
    private _streamLessonHlsUseCase: IStreamLessonHlsUseCase,
  ) {}

  /**
   * Creates a new lesson.
   */
  createLesson = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    logger.info(`Create lesson attempt from IP: ${req.ip}`);

    const instructorId = authenticatedReq.user.id;
    const validatedData = CreateLessonSchema.parse(authenticatedReq.body);

    const data = await this._createUseCase.execute(validatedData, instructorId);

    logger.info(
      `Lesson created successfully for module ${validatedData.moduleId}`,
    );
    ApiResponseHelper.created(res, 'Lesson created successfully.', data);
  };

  /**
   * Generates a signed URL for uploading a file.
   */
  getUploadUrl = async (req: Request, res: Response): Promise<void> => {
    logger.info(`Get upload URL attempt from IP: ${req.ip}`);

    const validatedData = GetUploadUrlSchema.parse(req.body);
    const result = await this._getUploadUrlUseCase.execute(validatedData);

    logger.info(`Upload URL generated for file ${validatedData.fileName}`);
    ApiResponseHelper.success(res, 'Upload URL generated successfully', result);
  };

  /**
   * Generates signed URLs for multiple video files.
   */
  getVideoSignedUrls = async (req: Request, res: Response): Promise<void> => {
    logger.info(`Get video signed URLs attempt from IP: ${req.ip}`);

    const validatedData = GetVideoSignedUrlsSchema.parse(req.body);
    const urls = await this._getVideoSignedUrlsUseCase.execute(
      validatedData.fileNames,
    );

    logger.info(
      `Signed URLs generated for ${validatedData.fileNames.length} files`,
    );
    ApiResponseHelper.success(res, 'Signed URLs generated successfully', urls);
  };

  /**
   * Streams HLS playlists and segments.
   */
  streamHls = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, file } = req.params;
      const result = await this._streamLessonHlsUseCase.execute(id, file);

      res.status(result.status);
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Cache-Control', result.cacheControl);
      if (result.contentLength) {
        res.setHeader('Content-Length', result.contentLength);
      }

      result.stream.pipe(res);
    } catch (err) {
      logger.error('Error streaming HLS media', err);
      res.status(500).send('Error streaming media');
    }
  };

  /**
   * Updates an existing lesson.
   */
  updateLesson = async (req: Request, res: Response): Promise<void> => {
    logger.info(`Update lesson attempt from IP: ${req.ip}`);
    const authenticatedReq = req as AuthenticatedRequest;
    const lessonId = authenticatedReq.params.id;
    const instructorId = authenticatedReq.user.id;
    const updates = UpdateLessonSchema.parse(authenticatedReq.body);

    await this._updateUseCase.execute(lessonId, instructorId, updates);
    logger.info(`Lesson ${lessonId} updated successfully`);
    ApiResponseHelper.success(res, 'Lesson updated successfully');
  };

  /**
   * Deletes a lesson.
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
   */
  blockLesson = async (req: Request, res: Response): Promise<void> => {
    logger.info(`Block lesson attempt from IP: ${req.ip}`);

    const lessonId = req.params.id;
    const validatedData = BlockLessonSchema.parse(req.body);
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
   */
  getLessonPlayUrl = async (req: Request, res: Response): Promise<void> => {
    logger.info(`Get lesson play URL attempt from IP: ${req.ip}`);
    const authenticatedReq = req as AuthenticatedRequest;

    const lessonId = authenticatedReq.params.id;
    const userId = authenticatedReq.user.id;
    const role = authenticatedReq.user.role as UserRole;

    const result = await this._getLessonPlayUrlUseCase.execute(
      userId,
      lessonId,
      role,
    );

    logger.info(`Lesson play URL generated for lesson ${lessonId}`);
    ApiResponseHelper.success(res, 'Play URL generated successfully', result);
  };
}
