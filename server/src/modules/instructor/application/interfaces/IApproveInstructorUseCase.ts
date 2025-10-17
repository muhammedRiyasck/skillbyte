export interface IApproveInstructorUseCase {
  execute(instructorId: string, adminId: string): Promise<void>;
}
