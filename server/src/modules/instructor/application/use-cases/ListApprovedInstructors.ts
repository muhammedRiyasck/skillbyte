import { IInstructorRepository } from "../../domain/IRepositories/IinstructorRepository"; 
import { Instructor } from "../../domain/entities/Instructor";

export class ListApprovedInstructorsUseCase {
  constructor(private repo: IInstructorRepository) {}

  async execute(): Promise<Instructor[]| null> {      
    const docs = await this.repo.findAllApproved();
    if(!docs) return null
    return docs
  }
}
