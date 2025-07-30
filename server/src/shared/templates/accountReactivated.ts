export function accountReactivatedEmailTemplate(name: string): string {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border-radius: 10px; border: 1px solid #4caf50;">
    <h2 style="color: #4caf50;">✅ Your SkillByte Account is Reactivated</h2>
    <p>Hi ${name},</p>
    <p>Good news! Your account has been reactivated and you can now access all platform features again.</p>
    <p style="margin-top: 40px;">Welcome back!<br>– SkillByte Team</p>
  </div>
  `;
}
