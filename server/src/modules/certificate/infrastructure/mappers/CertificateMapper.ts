import { ICertificate as CertificateEntity } from '../../domain/entities/Certificate';
import { ICertificate as CertificateDocument } from '../models/CertificateModel';

export class CertificateMapper {
  static toEntity(doc: CertificateDocument): CertificateEntity {
    return {
      certificateId: doc._id.toString(),
      enrollmentId: doc.enrollmentId.toString(),
      userId: doc.userId.toString(),
      courseId: doc.courseId.toString(),
      certificateNumber: doc.certificateNumber,
      verificationCode: doc.verificationCode,
      issuedAt: doc.issuedAt,
      pdfUrl: doc.pdfUrl,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
