export interface IChangeStudentStatusUseCase {
  execute(id: string, status: 'active' | 'blocked'): Promise<void>;
}
