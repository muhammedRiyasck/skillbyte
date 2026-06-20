import { CertificateResponseDto } from '../dtos/CertificateResponseDto';

export interface IIssueCertificateUseCase {
  execute(userId: string, courseId: string): Promise<CertificateResponseDto>;
}
