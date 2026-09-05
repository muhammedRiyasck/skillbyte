export const INSTRUCTOR_EVENTS = {
  RESUME_UPLOAD_REQUESTED: 'instructor.resume_upload_requested',
} as const;

export interface ResumeUploadRequestedEvent {
  instructorId: string;
  filePath: string;
  originalName: string;
  email: string;
}
