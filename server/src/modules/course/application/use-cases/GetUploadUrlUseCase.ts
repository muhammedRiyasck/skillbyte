import {
  IGetUploadUrlUseCase,
  GetUploadUrlInput,
  GetUploadUrlOutput,
} from '../interfaces/IGetUploadUrlUseCase';
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';

export class GetUploadUrlUseCase implements IGetUploadUrlUseCase {
  constructor(private readonly _storageService: IStorageService) {}

  async execute(input: GetUploadUrlInput): Promise<GetUploadUrlOutput> {
    const { fileName, contentType } = input;
    return this._storageService.generateUploadUrl(
      fileName,
      contentType || 'application/octet-stream',
    );
  }
}
