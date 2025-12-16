export function ResetPasswordTemplate(name: string, link: string): string {
  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; border: 1px solid #e0e0e0;">
 <img src="/assets/logo.png" alt="SkillByte Logo" style="max-width: 150px; display: block; margin: 0  10px;" />
    <h2 style="color: #3f51b5;">Hello ${name}</h2>
    <strong>Reset Your Password</strong>
    <p>We received a request to reset your Skillbyte account password. 
    If this was you, please click the link below to reset your password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
    <span style="font-size: 18px;  font-weight: bold; color: #3f51b5;">
    <p><a href="${link}">Click Here To Reset Password</a></p>
    </span>
    </div>
    <p>This link will expire in 15 minutes for security reasons.</p>
    <p style="color: #888;">If you didn’t request a password reset, you can safely ignore this email. 
    Your account will remain secure..</p>

    <p style="margin-top: 40px;">Thank you,<br>The SkillByte Team</p>
</div>
`;
}
