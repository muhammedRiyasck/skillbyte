export interface CertificateDetails {
  certificateId: string;
  certificateNumber: string;
  verificationCode: string;
  issuedAt: string;
  completedAt?: string;
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
