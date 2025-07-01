import { IMailerService } from "../../../../shared/services/mail/IMailerService";
import { accountReactivatedEmailTemplate } from "../../../../shared/templates/accountReactivated";
import { accountSuspendedEmailTemplate } from "../../../../shared/templates/accountSuspended";
import { IInstructorRepository } from "../../domain/IRepositories/IInstructorRepository";

export class ChangeInstructorStatusUseCase {
  constructor(private repo: IInstructorRepository,
    private mailer:IMailerService
  ) {}

  async execute(id: string, status: "active" | "suspended"): Promise<void> {
     await this.repo.changeStatus(id, status);
     const instructor = await this.repo.findById(id);
    if (!instructor) return;

    const template =
      status === "suspended"
        ? accountSuspendedEmailTemplate(instructor.name)
        : accountReactivatedEmailTemplate(instructor.name);

    const subject =
      status === "suspended"
        ? "⚠️ SkillByte Account Suspended"
        : "✅ SkillByte Account Reactivated";

    await this.mailer.sendMail(instructor.email, subject, template);
  }
}
