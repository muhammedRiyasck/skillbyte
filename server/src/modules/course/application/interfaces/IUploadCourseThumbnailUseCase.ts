export interface UploadThumbnailInput {
  courseId: string;
  instructorId: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
}

export interface IUploadCourseThumbnailUseCase {
  execute(
    input: UploadThumbnailInput,
  ): Promise<{ id: string; thumbnailUrl: string }>;
}
