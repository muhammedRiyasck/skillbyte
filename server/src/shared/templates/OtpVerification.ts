export function otpVerificationEmailTemplate(
  name: string,
  otp: string,
  subject?: string,
): string {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; border: 1px solid #e0e0e0;">
    <h2 style="color: #3f51b5;">Hey ${name}</h2>
    <h3>${subject}</h3>
    <strong>Verify Your Email</strong>
    <p>Thank you for signing up on <strong>SkillByte</strong>.</p>
    <p>Please enter the following OTP to verify your email address:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #3f51b5;">
        ${otp}
      </span>
    </div>

    <p style="color: #888;">This OTP will expire with in minutes. If you didn't request this, please ignore this email.</p>

    <p style="margin-top: 40px;">Best,<br>The SkillByte Team</p>
  </div>
  `;
}
