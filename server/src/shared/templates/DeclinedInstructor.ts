export function declinedInstructorEmailTemplate(
  name: string,
  reason?: string,
): string {
  const rejectionReason = reason
    ? reason
    : "Your application did not meet our current instructor requirements. Please review our guidelines and consider reapplying once you've updated your profile or teaching materials.";

  return `
  <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 24px; border-radius: 10px; border: 1px solid #e0e0e0; background-color: #ffffff; color: #333;">
    <h2 style="color: #e53935; text-align: center;">⚠️ Application Update, ${name}</h2>

    <p style="font-size: 16px; line-height: 1.6;">
      Thank you for applying to become an <strong>instructor</strong> on <strong>SkillByte</strong>.  
      After carefully reviewing your application, we regret to inform you that it has not been approved at this time.
    </p>

    <h3 style="color: #3f51b5; margin-top: 30px;">📝 Reason for Rejection</h3>
    <p style="font-size: 15px; line-height: 1.6; background-color: #fff8f8; border: 1px solid #ffdddd; padding: 12px; border-radius: 6px;">
      ${rejectionReason}
    </p>

    <h3 style="color: #3f51b5; margin-top: 30px;">📘 Next Steps</h3>
    <p style="font-size: 15px; line-height: 1.6;">
      We encourage you to:
    </p>
    <ul style="font-size: 15px; line-height: 1.8; padding-left: 20px;">
      <li><strong>Review our Instructor Guidelines</strong> to understand our quality standards</li>
      <li><strong>Update your profile and teaching materials</strong> based on the feedback</li>
      <li><strong>Reapply right after 2 days</strong> once you're ready</li>
    </ul>

    <p style="font-size: 16px; margin-top: 20px;">
      You can find our full guidelines here:  
      <a href="https://skillbyte.com/instructor-guidelines" style="color: #3f51b5; text-decoration: none; font-weight: bold;">View Instructor Guidelines →</a>
    </p>

    <div style="margin: 30px 0; padding: 15px; background-color: #fff8f8; border: 1px solid #ffdddd; border-radius: 8px;">
      <p style="font-size: 15px; margin: 0;">
        💡 <strong>Tip:</strong> Strengthen your profile, prepare quality sample content, and review our standards before reapplying.
      </p>
    </div>

    <p style="font-size: 16px; line-height: 1.6;">
      We truly appreciate your interest in becoming part of our teaching community and look forward to reviewing your updated application.
    </p>

    <p style="margin-top: 30px; font-size: 16px;">
      Best regards,<br>
      <strong>The SkillByte Team</strong>
    </p>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
    <p style="font-size: 12px; color: #888; text-align: center;">
      This is an automated message. Please do not reply directly to this email.  
      For assistance, visit our <a href="https://skillbyte.com/support" style="color: #3f51b5; text-decoration: none;">Help Center</a>.
    </p>
  </div>
  `;
}
