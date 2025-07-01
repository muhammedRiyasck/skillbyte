export function approvedInstructorEmailTemplate(name: string): string {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
    <h2 style="color: #4CAF50;">🎉 You're Approved, ${name}!</h2>
    <p>Welcome to <strong>SkillByte</strong> as an official instructor.</p>
    <p>You're now eligible to create and publish your first course.</p>
    <p style="margin-top: 30px;">Happy teaching!<br>The SkillByte Team</p>
  </div>
  `;
}
