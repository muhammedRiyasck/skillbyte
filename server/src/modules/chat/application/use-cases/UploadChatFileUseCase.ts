import { UploadBufferResult } from '../../../../shared/services/file-upload/services/CloudinaryStorageService';
import { CloudinaryStorageService } from '../../../../shared/services/file-upload/services/CloudinaryStorageService';

export class UploadChatFileUseCase {
  constructor(
    private readonly storageService: CloudinaryStorageService,
  ) {}

  async execute(file: Express.Multer.File): Promise<UploadBufferResult> {
    return this.storageService.uploadChatBuffer(file);
  }
}
