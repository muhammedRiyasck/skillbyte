export interface IUploadInstructorAvatarUseCase {
  execute(instructorId: string, filePath: string): Promise<string>;
}
