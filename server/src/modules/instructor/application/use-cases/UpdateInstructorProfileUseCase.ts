import { IInstructorRepository } from "../../domain/IRepositories/IInstructorRepository";
import { IUpdateInstructorProfileUseCase } from "../interfaces/IUpdateInstructorProfileUseCase";
import { Instructor } from "../../domain/entities/Instructor";

export class UpdateInstructorProfileUseCase implements IUpdateInstructorProfileUseCase {
  constructor(private readonly instructorRepository: IInstructorRepository) {}

  async execute(id: string, updates: Partial<Instructor>): Promise<void> {
    await this.instructorRepository.updateById(id, updates);
  }
}
