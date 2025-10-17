import { Instructor } from "../../domain/entities/Instructor";

export interface IListApprovedInstructorsUseCase {
  execute(): Promise<Instructor[]|null>; 
}
