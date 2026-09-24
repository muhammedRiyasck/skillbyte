import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../shared/types/AuthenticatedRequestType';
import { ApiResponseHelper } from '../../../shared/utils/ApiResponseHelper';
import { IIssueCertificateUseCase } from '../application/interfaces/IIssueCertificateUseCase';
import { IGetCertificateUseCase } from '../application/interfaces/IGetCertificateUseCase';
import { IVerifyCertificateUseCase } from '../application/interfaces/IVerifyCertificateUseCase';

/** Handles HTTP requests for certificate operations. */
export class CertificateController {
  constructor(
    private issueCertificateUc: IIssueCertificateUseCase,
    private getCertificateUc: IGetCertificateUseCase,
    private verifyCertificateUc: IVerifyCertificateUseCase,
  ) {}

  /**
   * Issue certificate for the Certificate entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  issueCertificate = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthenticatedRequest).user.id;
    const { courseId } = req.params;
    const certificate = await this.issueCertificateUc.execute(userId, courseId);
    ApiResponseHelper.success(res, 'Certificate issued', certificate);
  };

  /**
   * Get certificate for the Certificate entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  getCertificate = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthenticatedRequest).user.id;
    const certificate = await this.getCertificateUc.execute(
      req.params.certificateId,
      userId,
    );
    ApiResponseHelper.success(res, 'Certificate fetched', certificate);
  };

  /**
   * Verify certificate for the Certificate entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  verifyCertificate = async (req: Request, res: Response): Promise<void> => {
    const certificate = await this.verifyCertificateUc.execute(
      req.params.verificationCode,
    );
    ApiResponseHelper.success(res, 'Certificate verified', certificate);
  };
}
