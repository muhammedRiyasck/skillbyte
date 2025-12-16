export interface IDeleteInstructorUseCase {
  execute(id: string): Promise<void>;
}
