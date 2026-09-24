import {
  IGetUploadUrlUseCase,
  GetUploadUrlInput,
  GetUploadUrlOutput,
} from '../interfaces/IGetUploadUrlUseCase';
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';

/** Executes the business logic for get upload url. */
export class GetUploadUrlUseCase implements IGetUploadUrlUseCase {
  constructor(private readonly _storageService: IStorageService) {}

  /**
   * Execute for the GetUploadUrl entity.
   *
   * @param input - The input information.
   * @returns The result of the operation.
   */
  async execute(input: GetUploadUrlInput): Promise<GetUploadUrlOutput> {
    const { fileName, contentType } = input;
    return this._storageService.generateUploadUrl(
      fileName,
      contentType || 'application/octet-stream',
    );
  }
}
