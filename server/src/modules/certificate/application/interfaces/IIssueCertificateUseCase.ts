import { CertificateDto } from '../dtos/CertificateDto';

export interface IIssueCertificateUseCase {
  execute(userId: string, courseId: string): Promise<CertificateDto>;
}
