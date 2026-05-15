import { ICertificate } from '../entities/Certificate';

export interface ICertificateRepository {
  save(certificate: Partial<ICertificate>): Promise<ICertificate>;
  findById(id: string): Promise<ICertificate | null>;
  findByEnrollmentId(enrollmentId: string): Promise<ICertificate | null>;
  findByVerificationCode(code: string): Promise<ICertificate | null>;
}
