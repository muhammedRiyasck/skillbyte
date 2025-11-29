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
} as const;

export const QUEUE_NAMES = {
  INSTRUCTOR_REGISTRATION: 'instructor-registration',
  EMAIL: 'email',
  CLEANUP: 'cleanup',
} as const;
