import { CertificateResponseDto } from '../dtos/CertificateResponseDto';

export interface IVerifyCertificateUseCase {
  execute(verificationCode: string): Promise<CertificateResponseDto | null>;
}
