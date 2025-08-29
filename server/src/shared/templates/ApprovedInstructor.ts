export function approvedInstructorEmailTemplate(name: string): string {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 24px; border-radius: 10px; border: 1px solid #e0e0e0; background-color: #ffffff; color: #333;">
    <h2 style="color: #3f51b5; text-align: center;">🎉 Congratulations, ${name}!</h2>

    <p style="font-size: 16px; line-height: 1.6;">
      We’re thrilled to inform you that your application to become an <strong>official instructor</strong> on <strong>SkillByte</strong> has been <span style="color: #3f51b5; font-weight: bold;">approved</span>! 
      Your expertise and passion for teaching will help learners around the world grow and achieve their goals.
    </p>

    <h3 style="color: #3f51b5; margin-top: 30px;">🚀 What’s Next?</h3>
    <ul style="font-size: 15px; line-height: 1.8; padding-left: 20px;">
      <li><strong>Set up your instructor profile</strong> – Add your bio, profile picture, and background to build trust with learners.</li>
      <li><strong>Create your first course</strong> – Start designing engaging lessons using our intuitive course builder.</li>
      <li><strong>Publish & earn</strong> – Once approved, your course will be live for thousands of eager learners to explore.</li>
    </ul>

    <p style="font-size: 16px; margin-top: 20px;">
      We’ve prepared a detailed guide to help you get started:  
      <a href="https://skillbyte.com/instructor-guide" style="color: #3f51b5; text-decoration: none; font-weight: bold;">Read the Instructor Guide →</a>
    </p>

    <div style="margin: 30px 0; padding: 15px; background-color: #f7f9ff; border: 1px solid #dce3ff; border-radius: 8px;">
      <p style="font-size: 15px; margin: 0;">
        💡 <strong>Pro Tip:</strong> The most successful instructors publish consistently, engage with their students, and keep their content up to date.
      </p>
    </div>

    <p style="font-size: 16px; line-height: 1.6;">
      We’re excited to have you join our growing community of educators. Together, let’s inspire learners and make an impact.
    </p>

    <p style="margin-top: 30px; font-size: 16px;">
      Best regards,<br>
      <strong>The SkillByte Team</strong>
    </p>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
    <p style="font-size: 12px; color: #888; text-align: center;">
      This is an automated message. Please do not reply directly to this email.  
      For support, visit our <a href="https://skillbyte.com/support" style="color: #3f51b5; text-decoration: none;">Help Center</a>.
    </p>
  </div>
  `;
}
