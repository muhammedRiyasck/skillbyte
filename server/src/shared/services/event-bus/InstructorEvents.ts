export const INSTRUCTOR_EVENTS = {
  RESUME_UPLOAD_REQUESTED: 'instructor.resume_upload_requested',
} as const;

export interface ResumeUploadRequestedEvent {
  instructorId: string;
  fileBuffer: string; // base64-encoded file content
  originalName: string;
  mimetype: string;
  email: string;
}
