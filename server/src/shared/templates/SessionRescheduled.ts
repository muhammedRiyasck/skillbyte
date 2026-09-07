export function sessionRescheduledEmailTemplate(
  studentName: string,
  instructorName: string,
  sessionTitle: string,
  oldScheduledAt: Date,
  newScheduledAt: Date,
  videoRoomUrl?: string,
  reason?: string,
): string {
  const formatDateTime = (d: Date) =>
    new Intl.DateTimeFormat('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(d);

  return `
  <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 24px; border-radius: 10px; border: 1px solid #e0e0e0; background-color: #ffffff; color: #333;">
    <h2 style="color: #4f46e5; text-align: center;">📅 Mentorship Session Rescheduled</h2>

    <p style="font-size: 16px; line-height: 1.6;">
      Hi <strong>${studentName}</strong>,
    </p>

    <p style="font-size: 15px; line-height: 1.6;">
      Your mentorship session <strong>"${sessionTitle}"</strong> with <strong>${instructorName}</strong> has been rescheduled.
    </p>

    <div style="margin: 24px 0; padding: 18px; background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
        <span style="text-decoration: line-through; color: #9ca3af;">Previous Time: ${formatDateTime(oldScheduledAt)}</span>
      </p>
      <p style="margin: 0; font-size: 16px; font-weight: bold; color: #4338ca;">
        ✨ New Time: ${formatDateTime(newScheduledAt)}
      </p>
    </div>

    ${
      reason
        ? `
    <div style="margin: 20px 0; padding: 14px; background-color: #f9fafb; border-left: 4px solid #4f46e5; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; color: #4b5563;">
        <strong>Note from instructor:</strong> "${reason}"
      </p>
    </div>
    `
        : ''
    }

    ${
      videoRoomUrl
        ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${videoRoomUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">
        Join Video Session
      </a>
    </div>
    `
        : ''
    }

    <p style="font-size: 14px; line-height: 1.6; color: #6b7280;">
      You can also view your updated session details and join links directly on your <a href="https://skillbyte.com/dashboard/bookings" style="color: #4f46e5; text-decoration: none; font-weight: bold;">SkillByte Bookings Dashboard</a>.
    </p>

    <p style="margin-top: 30px; font-size: 15px;">
      Best regards,<br>
      <strong>The SkillByte Team</strong>
    </p>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
    <p style="font-size: 12px; color: #888; text-align: center;">
      This is an automated notification. If you have any questions or cannot make this new time, you can reschedule or reach out via the chat platform.
    </p>
  </div>
  `;
}
