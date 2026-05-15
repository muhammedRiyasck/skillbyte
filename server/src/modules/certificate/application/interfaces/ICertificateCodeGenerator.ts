export interface ICertificateCodeGenerator {
  generateCertificateNumber(): string;
  generateVerificationCode(): string;
}
