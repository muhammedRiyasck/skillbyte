import { IStudentRepository } from "../../domain/IRepositories/IStudentRepository";
import { Student } from "../../domain/entities/Student";

export class ListAllStudentsUseCase {
  constructor(private repo: IStudentRepository) {}

  async execute(): Promise<Student[]|null> {
    const docs = await this.repo.findAll();
    if(docs) return null
    return docs
  }
}
