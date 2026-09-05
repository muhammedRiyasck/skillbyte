export interface IRemoveStudentAvatarUseCase {
  execute(studentId: string): Promise<void>;
}
