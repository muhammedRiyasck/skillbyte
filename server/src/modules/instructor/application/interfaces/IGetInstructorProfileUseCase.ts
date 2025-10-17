import { Instructor } from "../../domain/entities/Instructor";

export interface IGetInstructorProfileUseCase {
  execute(id: string): Promise<Instructor | null>;
}
