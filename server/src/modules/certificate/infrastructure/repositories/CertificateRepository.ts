import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { ICertificate as CertificateEntity } from '../../domain/entities/Certificate';
import { ICertificateRepository } from '../../domain/IRepositories/ICertificateRepository';
import {
  CertificateModel,
  ICertificate as CertificateDocument,
} from '../models/CertificateModel';
import { CertificateMapper } from '../mappers/CertificateMapper';

export class CertificateRepository
  extends BaseRepository<CertificateEntity, CertificateDocument>
  implements ICertificateRepository
{
  constructor() {
    super(CertificateModel);
  }

  toEntity(doc: CertificateDocument): CertificateEntity {
    return CertificateMapper.toEntity(doc);
  }

  async findByEnrollmentId(
    enrollmentId: string,
  ): Promise<CertificateEntity | null> {
    const doc = await this.model.findOne({ enrollmentId });
    return doc ? this.toEntity(doc) : null;
  }

  async findByVerificationCode(
    code: string,
  ): Promise<CertificateEntity | null> {
    const doc = await this.model.findOne({ verificationCode: code });
    return doc ? this.toEntity(doc) : null;
  }
}
