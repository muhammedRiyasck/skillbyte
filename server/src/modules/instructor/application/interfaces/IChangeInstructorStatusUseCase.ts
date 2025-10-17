export interface IChangeInstructorStatusUseCase {
  execute(id: string, status: "active" | "suspend",note?:string): Promise<void>;
}
