export interface IDeclineInstructorUseCase {
  execute(instructorId: string, adminId: string, reason: string): Promise<void>;
}
