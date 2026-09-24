import { UploadBufferResult } from '../../../../shared/services/file-upload/services/CloudinaryStorageService';
import { CloudinaryStorageService } from '../../../../shared/services/file-upload/services/CloudinaryStorageService';

/** Executes the business logic for upload chat file. */
export class UploadChatFileUseCase {
  constructor(private readonly storageService: CloudinaryStorageService) {}

  /**
   * Execute for the UploadChatFile entity.
   *
   * @param file - The file information.
   * @returns The result of the operation.
   */
  async execute(file: Express.Multer.File): Promise<UploadBufferResult> {
    return this.storageService.uploadChatBuffer(file);
  }
}
