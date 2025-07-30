import { IStudentRepository } from "../../domain/IRepositories/IStudentRepository";

export class ChangeStudentStatusUseCase {
  constructor(private repo: IStudentRepository) {}

  async execute(id: string, status: "active" | "blocked"): Promise<void> {
    return await this.repo.changeStatus(id, status);
  }
}
