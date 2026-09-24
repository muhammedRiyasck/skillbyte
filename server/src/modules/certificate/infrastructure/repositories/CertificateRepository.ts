import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { ICertificate as CertificateEntity } from '../../domain/entities/Certificate';
import { ICertificateRepository } from '../../domain/IRepositories/ICertificateRepository';
import {
  CertificateModel,
  ICertificate as CertificateDocument,
} from '../models/CertificateModel';
import { CertificateMapper } from '../mappers/CertificateMapper';

/** Manages database operations for certificate. */
export class CertificateRepository
  extends BaseRepository<CertificateEntity, CertificateDocument>
  implements ICertificateRepository
{
  constructor() {
    super(CertificateModel);
  }

  /**
   * To entity for the Certificate entity.
   *
   * @param doc - The doc information.
   * @returns The result of the operation.
   */
  toEntity(doc: CertificateDocument): CertificateEntity {
    return CertificateMapper.toEntity(doc);
  }

  /**
   * Find by enrollment id for the Certificate entity.
   *
   * @param enrollmentId - The unique identifier for the enrollment.
   * @returns The result of the operation.
   */
  async findByEnrollmentId(
    enrollmentId: string,
  ): Promise<CertificateEntity | null> {
    const doc = await this.model.findOne({ enrollmentId });
    return doc ? this.toEntity(doc) : null;
  }

  /**
   * Find by verification code for the Certificate entity.
   *
   * @param code - The code information.
   * @returns The result of the operation.
   */
  async findByVerificationCode(
    code: string,
  ): Promise<CertificateEntity | null> {
    const doc = await this.model.findOne({ verificationCode: code });
    return doc ? this.toEntity(doc) : null;
  }
}
