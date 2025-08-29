
import { IMailerService } from "../../../../shared/services/mail/IMailerService";
import { IInstructorRepository } from "../../domain/IRepositories/IInstructorRepository";

import { approvedInstructorEmailTemplate } from "../../../../shared/templates/ApprovedInstructor";

export class ApproveInstructorUseCase {
  constructor(
    private repo: IInstructorRepository,
    private mailer: IMailerService
  ){}

  async execute(id: string, adminId: string): Promise<void> {
    try {
      
      await this.repo.approve(id, adminId);
 
      const instructor = await this.repo.findById(id);
     if (instructor) {
       await this.mailer.sendMail(
         instructor.email,
         "🎉 SkillByte Instructor Approved",
         approvedInstructorEmailTemplate(instructor.name)
       );
     }
    } catch (error:any) {
      throw new Error(error.message)
    }
  }
}
