export interface VideoSignedUrlResult {
  fileName: string;
  url: string;
}

export interface IGetVideoSignedUrlsUseCase {
  execute(fileNames: string[]): Promise<VideoSignedUrlResult[]>;
}
