export interface IRemoveInstructorAvatarUseCase {
  execute(instructorId: string): Promise<void>;
}
