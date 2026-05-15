import { CertificateDto } from '../dtos/CertificateDto';

export interface IVerifyCertificateUseCase {
  execute(verificationCode: string): Promise<CertificateDto>;
}
