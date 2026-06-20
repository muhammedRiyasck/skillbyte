import { CertificateResponseDto } from '../dtos/CertificateResponseDto';

export interface IGetCertificateUseCase {
  execute(
    certificateId: string,
    userId: string,
  ): Promise<CertificateResponseDto | null>;
}
