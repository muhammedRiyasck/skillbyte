import { Request, Response } from "express";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, updateCors } from '../../../../shared/config/backblaze/S3Client';
import { HttpStatusCode } from "../../../../shared/enums/HttpStatusCodes";
import { HttpError } from "../../../../shared/types/HttpError";
import { ICreateLessonUseCase } from "../../application/interfaces/ICreateLessonUseCase";
import { IUpdateLessonUseCase } from "../../application/interfaces/IUpdateLessonUseCase";
import { IDeleteLessonUseCase } from "../../application/interfaces/IDeleteLessonUseCase";
import { IBlockLessonUseCase } from "../../application/interfaces/IBlockLessonUseCase";
import { IGetLessonPlayUrlUseCase } from "../../application/interfaces/IGetLessonPlayUrlUseCase";
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import logger from '../../../../shared/utils/Logger';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { ERROR_MESSAGES } from "../../../../shared/constants/messages";

export class LessonController {
  constructor(
    private _createUseCase: ICreateLessonUseCase,
    private _updateUseCase: IUpdateLessonUseCase,
    private _blockUseCase : IBlockLessonUseCase,
    private _deleteUseCase: IDeleteLessonUseCase,
    private _getLessonPlayUrlUseCase: IGetLessonPlayUrlUseCase
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
    const { moduleId, title, description, contentType, fileName, order, resources } = authenticatedReq.body;

    const data = await this._createUseCase.execute({
      moduleId,
      instructorId,
      title,
      description,
      contentType,
      fileName,
      order,
      duration: authenticatedReq.body.duration,
      resources,
      isFreePreview: authenticatedReq.body.isFreePreview || false,
      isBlocked:false,
      isPublished: authenticatedReq.body.isPublished || true,
    });

    logger.info(`Lesson created successfully for module ${moduleId}`);
    ApiResponseHelper.created(res, "Lesson created successfully.", data);
  };

  /**
   * Generates a signed URL for uploading a file to S3.
   * @param req - Authenticated request object.
   * @param res - Express response object.
   */
  getUploadUrl = async (req: Request, res: Response): Promise<void> => {
     const authenticatedReq = req as AuthenticatedRequest;
    logger.info(`Get upload URL attempt from IP: ${req.ip}`);

    const { fileName } = authenticatedReq.body;

    if (!fileName) {
      logger.warn('File name missing in get upload URL');
      throw new HttpError("File name required", HttpStatusCode.BAD_REQUEST);
    }

    const command = new PutObjectCommand({
      Bucket: process.env.B2_S3_BUCKET!,
      Key: fileName,
      ContentType: 'video',
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });
    const publicUrl = `${process.env.B2_S3_ENDPOINT}/${encodeURIComponent(fileName)}`;
    updateCors();
    logger.info(`Upload URL generated for file ${fileName}`);
    ApiResponseHelper.success(res, "Upload URL generated successfully", { signedUrl, publicUrl });
  };

  /**
   * Generates signed URLs for multiple video files.
   * @param req - Authenticated request object.
   * @param res - Express response object.
   */
  getVideoSignedUrls = async (req: Request, res: Response): Promise<void> => {
      const authenticatedReq = req as AuthenticatedRequest;
    logger.info(`Get video signed URLs attempt from IP: ${req.ip}`);

    const fileNames: string[] = authenticatedReq.body.fileNames;

    if (!fileNames || !Array.isArray(fileNames) || fileNames.length === 0) {
      logger.warn('Invalid fileNames array in get video signed URLs');
      throw new HttpError(ERROR_MESSAGES.INVALID_INPUT, HttpStatusCode.BAD_REQUEST);
    }

    const urls = await Promise.all(
      fileNames.map(async (fileName) => {
        const command = new GetObjectCommand({
          Bucket: process.env.B2_S3_BUCKET,
          Key: fileName,
        });
        const url = await getSignedUrl(s3, command, { expiresIn: 60*5  }); // 60*30 = 30minutes
        return { fileName, url };
      })
    );
    logger.info(`Signed URLs generated for ${fileNames.length} files`);
    ApiResponseHelper.success(res, "Signed URLs generated successfully", urls);
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
    const updates = authenticatedReq.body;

    await this._updateUseCase.execute(lessonId, instructorId, updates);
    logger.info(`Lesson ${lessonId} updated successfully`);
    ApiResponseHelper.success(res, "Lesson updated successfully");
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
    ApiResponseHelper.success(res, "Lesson deleted successfully.");
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
    const { isBlocked } = authenticatedReq.body;

    if (typeof isBlocked !== 'boolean') {
      throw new HttpError("isBlocked must be a boolean", HttpStatusCode.BAD_REQUEST);
    }

    const lesson = await this._blockUseCase.execute(lessonId, isBlocked);
    logger.info(`Lesson ${lessonId} ${isBlocked ? 'blocked' : 'unblocked'} successfully`);
    ApiResponseHelper.success(res, `Lesson ${isBlocked ? 'blocked' : 'unblocked'} successfully`, lesson);
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

    const { signedUrl } = await this._getLessonPlayUrlUseCase.execute(userId, lessonId, role);
    
    logger.info(`Lesson play URL generated for lesson ${lessonId}`);
    ApiResponseHelper.success(res, "Play URL generated successfully", { signedUrl });
  };
}
