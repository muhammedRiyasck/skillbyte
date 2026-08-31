export interface ResumeUploadJobData {
  instructorId: string;
  filePath: string;
  originalName: string;
  email: string;
}

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  instructorName?: string;
}

export const JOB_NAMES = {
  RESUME_UPLOAD: 'resume-upload',
  SEND_EMAIL: 'send-email',
  DELETE_DECLINED_INSTRUCTOR: 'delete-declined-instructor',
  MENTORSHIP_CLEANUP: 'mentorship-cleanup',
  MENTORSHIP_AUTO_COMPLETE: 'mentorship-auto-complete',
  REFRESH_TOP_INSTRUCTORS: 'refresh-top-instructors',
  VIDEO_TRANSCODE: 'video-transcode',
} as const;

export const QUEUE_NAMES = {
  INSTRUCTOR_REGISTRATION: 'instructor-registration',
  EMAIL: 'email',
  CLEANUP: 'cleanup',
  MENTORSHIP: 'mentorship',
  COURSE: 'course',
} as const;

export interface MentorshipCleanupJobData {
  bookingId: string;
}
