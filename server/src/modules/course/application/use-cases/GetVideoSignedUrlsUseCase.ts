import {
  IGetVideoSignedUrlsUseCase,
  VideoSignedUrlResult,
} from '../interfaces/IGetVideoSignedUrlsUseCase';
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';

export class GetVideoSignedUrlsUseCase implements IGetVideoSignedUrlsUseCase {
  constructor(private readonly _storageService: IStorageService) {}

  async execute(fileNames: string[]): Promise<VideoSignedUrlResult[]> {
    return Promise.all(
      fileNames.map(async (fileName) => {
        const url = await this._storageService.getSignedUrl(fileName, 300);
        return { fileName, url };
      }),
    );
  }
}
