import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';
import { UploadBufferResult } from '../../../../shared/services/file-upload/services/CloudinaryStorageService';

export class UploadChatFileUseCase {
  constructor(
    private readonly storageService: IStorageService & {
      uploadBuffer(file: Express.Multer.File): Promise<UploadBufferResult>;
    },
  ) {}

  async execute(file: Express.Multer.File): Promise<UploadBufferResult> {
    return this.storageService.uploadBuffer(file);
  }
}
