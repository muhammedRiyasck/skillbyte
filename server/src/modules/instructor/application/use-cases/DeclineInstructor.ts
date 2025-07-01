import { IMailerService } from "../../../../shared/services/mail/IMailerService";
import { IInstructorRepository } from "../../domain/IRepositories/IInstructorRepository";
import { declinedInstructorEmailTemplate } from "../../../../shared/templates/declinedInstructor";
export class DeclineInstructorUseCase {
  constructor(private repo: IInstructorRepository,private mailer:IMailerService) {}

  async execute(id: string, reason: string): Promise<void> {
     await this.repo.decline(id, reason);

     const instructor = await this.repo.findById(id);
    if (instructor) {
      await this.mailer.sendMail(
        instructor.email,
        "⚠️ SkillByte Instructor Application Declined",
       declinedInstructorEmailTemplate(instructor.name,reason)
      );
    }
  }
}
