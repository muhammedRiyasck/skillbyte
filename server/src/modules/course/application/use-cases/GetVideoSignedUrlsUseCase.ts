import {
  IGetVideoSignedUrlsUseCase,
  VideoSignedUrlResult,
} from '../interfaces/IGetVideoSignedUrlsUseCase';
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';

/** Executes the business logic for get video signed urls. */
export class GetVideoSignedUrlsUseCase implements IGetVideoSignedUrlsUseCase {
  constructor(private readonly _storageService: IStorageService) {}

  /**
   * Execute for the GetVideoSignedUrls entity.
   *
   * @param fileNames - The file names information.
   * @returns The result of the operation.
   */
  async execute(fileNames: string[]): Promise<VideoSignedUrlResult[]> {
    return Promise.all(
      fileNames.map(async (fileName) => {
        const url = await this._storageService.getSignedUrl(fileName, 300);
        return { fileName, url };
      }),
    );
  }
}
