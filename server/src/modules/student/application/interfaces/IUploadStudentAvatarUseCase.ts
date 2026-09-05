export interface IUploadStudentAvatarUseCase {
  execute(studentId: string, filePath: string): Promise<string>;
}
