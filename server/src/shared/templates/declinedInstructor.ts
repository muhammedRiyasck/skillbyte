export function declinedInstructorEmailTemplate(name: string, reason: string): string {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
    <h2 style="color: #F44336;">⚠️ Application Declined</h2>
    <p>Hi ${name},</p>
    <p>Unfortunately, your SkillByte instructor application was declined for the following reason:</p>
    <blockquote style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #F44336; font-style: italic;">
      ${reason}
    </blockquote>
    <p>You can reapply after addressing this issue.</p>
    <p style="margin-top: 30px;">Best wishes,<br>The SkillByte Team</p>
  </div>
  `;
}
