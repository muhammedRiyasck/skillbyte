
export interface IDeleteModuleUseCase {
  execute(moduleId: string, instructorId: string): Promise<void>;
}
