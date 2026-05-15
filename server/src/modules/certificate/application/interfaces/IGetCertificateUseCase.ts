import { CertificateDto } from '../dtos/CertificateDto';

export interface IGetCertificateUseCase {
  execute(certificateId: string, userId?: string): Promise<CertificateDto>;
}
