export interface GetUploadUrlInput {
  fileName: string;
  contentType?: string;
}

export interface GetUploadUrlOutput {
  signedUrl: string;
  publicUrl: string;
}

export interface IGetUploadUrlUseCase {
  execute(input: GetUploadUrlInput): Promise<GetUploadUrlOutput>;
}
