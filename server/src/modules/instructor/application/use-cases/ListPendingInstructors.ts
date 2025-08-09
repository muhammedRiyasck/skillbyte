import { Instructor } from "../../domain/entities/Instructor";
import { IInstructorRepository } from "../../domain/IRepositories/IinstructorRepository";

export class ListPendingInstructorsUseCase {
  constructor(private repo: IInstructorRepository) {}

  async execute(): Promise<Instructor[]|null> {
    return await this.repo.listPending();
  }
}
