import { Instructor } from "../../domain/entities/Instructor";

export interface IUpdateInstructorProfileUseCase {
  execute(id: string, updates: Partial<Instructor>): Promise<void>;
}
