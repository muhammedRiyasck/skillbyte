export function accountSuspendedEmailTemplate(name: string): string {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border-radius: 10px; border: 1px solid #f44336;">
    <h2 style="color: #f44336;">⚠️ Your SkillByte Account is Suspended</h2>
    <p>Hi ${name},</p>
    <p>Your account has been temporarily suspended by the SkillByte admin team.</p>
    <p>If you believe this is a mistake, please contact support.</p>
    <p style="margin-top: 40px;">– SkillByte Team</p>
  </div>
  `;
}
