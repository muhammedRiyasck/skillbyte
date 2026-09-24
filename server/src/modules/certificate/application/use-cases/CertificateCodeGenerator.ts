import crypto from 'crypto';
import { ICertificateCodeGenerator } from '../interfaces/ICertificateCodeGenerator';

/** Handles certificate code generator functionality. */
export class CertificateCodeGenerator implements ICertificateCodeGenerator {
  /**
   * Generate certificate number for the CertificateCodeGenerator entity.
   *
   * @returns The result of the operation.
   */
  generateCertificateNumber(): string {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `SKB-${datePart}-${randomPart}`;
  }

  /**
   * Generate verification code for the CertificateCodeGenerator entity.
   *
   * @returns The result of the operation.
   */
  generateVerificationCode(): string {
    return crypto.randomBytes(12).toString('hex');
  }
}
