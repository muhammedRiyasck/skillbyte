import crypto from 'crypto';
import { ICertificateCodeGenerator } from '../interfaces/ICertificateCodeGenerator';

export class CertificateCodeGenerator implements ICertificateCodeGenerator {
  generateCertificateNumber(): string {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `SKB-${datePart}-${randomPart}`;
  }

  generateVerificationCode(): string {
    return crypto.randomBytes(12).toString('hex');
  }
}
