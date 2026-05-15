export interface ICertificate {
  certificateId?: string;
  enrollmentId: string;
  userId: string;
  courseId: string;
  certificateNumber: string;
  verificationCode: string;
  issuedAt: Date;
  pdfUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
