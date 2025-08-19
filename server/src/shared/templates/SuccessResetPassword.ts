export function SuccessResetPasswordTemplate(name: string): string {
return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; border: 1px solid #e0e0e0;">
 <img src="/assets/logo.png" alt="SkillByte Logo" style="max-width: 150px; display: block; margin: 0  10px;" />
    <h2 style="color: #3f51b5;">Hello ${name}</h2>
    <strong style="">Your SkillByte account password has been successfully reseted.</strong>
    <p>If this was you, no further action is required.  
   If you didn't reset your password, please contact our support team immediately.</p>
    
  
    <p style="color: #888;">skillbyte.team@gmail.com</p>
    <p Thank you for helping us keep your account secure.</p>

    <p style="margin-top: 40px;">Thank you,<br>The SkillByte Team</p>
</div>
`;
}
