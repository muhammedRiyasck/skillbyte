import { Request, Response } from 'express';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3, updateCors } from '../../../../shared/config/backblaze/S3Client';
import { ICreateLessonUseCase } from '../../application/interfaces/ICreateLessonUseCase';
import { IUpdateLessonUseCase } from '../../application/interfaces/IUpdateLessonUseCase';
import { IDeleteLessonUseCase } from '../../application/interfaces/IDeleteLessonUseCase';
import { IBlockLessonUseCase } from '../../application/interfaces/IBlockLessonUseCase';
import { IGetLessonPlayUrlUseCase } from '../../application/interfaces/IGetLessonPlayUrlUseCase';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import {
  CreateLessonSchema,
  GetUploadUrlSchema,
  GetVideoSignedUrlsSchema,
  BlockLessonSchema,
  UpdateLessonSchema,
} from '../../application/dtos/LessonDtos';
import { LessonMapper } from '../../application/mappers/LessonMapper';
import logger from '../../../../shared/utils/Logger';

export class LessonController {
  constructor(
    private _createUseCase: ICreateLessonUseCase,
    private _updateUseCase: IUpdateLessonUseCase,
    private _blockUseCase: IBlockLessonUseCase,
    private _deleteUseCase: IDeleteLessonUseCase,
    private _getLessonPlayUrlUseCase: IGetLessonPlayUrlUseCase,
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
    const { fileName } = validatedData;

    // ... logic mostly same but fileName is validated ...

    const command = new PutObjectCommand({
      Bucket: process.env.B2_S3_BUCKET!,
      Key: fileName,
      ContentType: 'video', // or validatedData.contentType
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });
    const publicUrl = `${process.env.B2_S3_ENDPOINT}/${encodeURIComponent(fileName)}`;
    updateCors();
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
        const command = new GetObjectCommand({
          Bucket: process.env.B2_S3_BUCKET,
          Key: fileName,
        });
        const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 }); // 60*30 = 30minutes
        return { fileName, url };
      }),
    );
    logger.info(`Signed URLs generated for ${fileNames.length} files`);
    ApiResponseHelper.success(res, 'Signed URLs generated successfully', urls);
  };

  /**
   * Updates an existing lesson.
   * @param req - Authenticated request object.
   * @param res - Express response object.
   */
  updateLesson = async (req: Request, res: Response): Promise<void> => {
    logger.info(`Update lesson attempt from IP: ${req.ip}`);
    const authenticatedReq = req as AuthenticatedRequest;
    const lessonId = authenticatedReq.params.lessonId;
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

    const lessonId = authenticatedReq.params.lessonId;
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

    const lessonId = authenticatedReq.params.lessonId;
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

    const lessonId = authenticatedReq.params.lessonId;
    const userId = authenticatedReq.user.id;
    const role = authenticatedReq.user.role;

    const { signedUrl } = await this._getLessonPlayUrlUseCase.execute(
      userId,
      lessonId,
      role,
    );

    logger.info(`Lesson play URL generated for lesson ${lessonId}`);
    ApiResponseHelper.success(res, 'Play URL generated successfully', {
      signedUrl,
    });
  };
}
