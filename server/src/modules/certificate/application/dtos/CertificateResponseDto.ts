export interface CertificateResponseDto {
  certificateId: string;
  certificateNumber: string;
  verificationCode: string;
  issuedAt: Date;
  completedAt?: Date;
  student: {
    id: string;
    name: string;
  };
  course: {
    id: string;
    title: string;
    category: string;
    courseLevel: string;
    duration: string;
  };
  instructor: {
    id: string;
    name: string;
    title: string;
  };
}
