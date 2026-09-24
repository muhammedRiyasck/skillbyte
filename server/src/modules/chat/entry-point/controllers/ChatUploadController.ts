import { Request, Response } from 'express';
import { UploadChatFileUseCase } from '../../application/use-cases/UploadChatFileUseCase';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

const MAX_FILE_SIZE_MB = 300;

/** Handles HTTP requests for chat upload operations. */
export class ChatUploadController {
  constructor(private readonly uploadChatFileUseCase: UploadChatFileUseCase) {}

  /**
   * Upload file for the ChatUpload entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  uploadFile = async (req: Request, res: Response): Promise<void> => {
    const file = req.file;
    if (!file) {
      throw new HttpError('No file uploaded', HttpStatusCode.BAD_REQUEST);
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      throw new HttpError(
        `File size exceeds ${MAX_FILE_SIZE_MB}MB limit`,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const result = await this.uploadChatFileUseCase.execute(file);

    ApiResponseHelper.success(res, 'File uploaded successfully', result);
  };
}
