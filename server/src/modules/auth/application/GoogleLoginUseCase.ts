import { IInstructorRepository } from "../../instructor/domain/IRepositories/IinstructorRepository";
import { IStudentRepository } from "../../student/domain/IRepositories/IStudentRepository";

export class GoogleLoginUseCase{
      constructor(
          private studentRepo : IStudentRepository,
          private instructorRepo : IInstructorRepository,
        ){}

    async execute(id:string,role:string){
        if(!id || ! role) throw new Error('id and role is required')
        const userRepo = role === 'student' ? this.studentRepo : this.instructorRepo
        const userData = await userRepo.findById(id)
        return userData
    }
}
