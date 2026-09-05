import { Response, Request } from 'express';
import { IGetInstructorProfileUseCase } from '../../application/interfaces/IGetInstructorProfileUseCase';
import { IUpdateInstructorProfileUseCase } from '../../application/interfaces/IUpdateInstructorProfileUseCase';
import { CreateStripeOnboardingLinkUseCase } from '../../application/use-cases/CreateStripeOnboardingLinkUseCase';
import { ISyncStripeAccountStatusUseCase } from '../../application/interfaces/ISyncStripeAccountStatusUseCase';
import { IUploadInstructorAvatarUseCase } from '../../application/interfaces/IUploadInstructorAvatarUseCase';
import { IRemoveInstructorAvatarUseCase } from '../../application/interfaces/IRemoveInstructorAvatarUseCase';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { HttpError } from '../../../../shared/types/HttpError';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { InstructorMapper } from '../../application/mappers/InstructorMapper';
import { InstructorProfileUpdateRequestDto } from '../../application/dtos/InstructorRequestDto';

/**
 * Controller for instructor profile operations.
 * Pure HTTP routing layer delegating all business logic to focused use cases.
 */
export class InstructorProfileController {
  constructor(
    private readonly _getInstructorProfileUseCase: IGetInstructorProfileUseCase,
    private readonly _updateInstructorProfileUseCase: IUpdateInstructorProfileUseCase,
    private readonly _createStripeOnboardingLinkUseCase: CreateStripeOnboardingLinkUseCase,
    private readonly _syncStripeStatusUseCase: ISyncStripeAccountStatusUseCase,
    private readonly _uploadAvatarUc: IUploadInstructorAvatarUseCase,
    private readonly _removeAvatarUc: IRemoveInstructorAvatarUseCase,
  ) {}

  getProfile = async (req: Request, res: Response): Promise<void> => {
    const authenticatedRequest = req as AuthenticatedRequest;
    const instructorId = authenticatedRequest.user.id;
    const instructor =
      await this._getInstructorProfileUseCase.execute(instructorId);
    if (!instructor) {
      throw new HttpError(
        ERROR_MESSAGES.INSTRUCTOR_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }
    ApiResponseHelper.success(
      res,
      'Instructor profile retrieved successfully',
      { instructor },
    );
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    const authenticatedRequest = req as AuthenticatedRequest;
    const instructorId = authenticatedRequest.user.id;
    const dto: InstructorProfileUpdateRequestDto = req.body;
    const updates = InstructorMapper.toUpdateProfileEntity(dto);

    await this._updateInstructorProfileUseCase.execute(instructorId, updates);
    ApiResponseHelper.success(res, 'Profile updated successfully');
  };

  uploadProfileImage = async (req: Request, res: Response): Promise<void> => {
    const authenticatedRequest = req as AuthenticatedRequest;
    const instructorId = authenticatedRequest.user.id;
    const file = authenticatedRequest.file;
    if (!file) {
      throw new HttpError(
        ERROR_MESSAGES.NO_FILE_UPLOADED,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const url = await this._uploadAvatarUc.execute(instructorId, file.path);
    ApiResponseHelper.success(res, 'Profile image uploaded successfully', {
      url,
    });
  };

  removeProfileImage = async (req: Request, res: Response): Promise<void> => {
    const authenticatedRequest = req as AuthenticatedRequest;
    const instructorId = authenticatedRequest.user.id;
    await this._removeAvatarUc.execute(instructorId);
    ApiResponseHelper.success(res, 'Profile image removed');
  };

  createStripeOnboardingLink = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const authenticatedRequest = req as AuthenticatedRequest;
    const instructorId = authenticatedRequest.user.id;
    const url =
      await this._createStripeOnboardingLinkUseCase.execute(instructorId);
    ApiResponseHelper.success(res, 'Onboarding link created successfully', {
      url,
    });
  };

  syncStripeStatus = async (req: Request, res: Response): Promise<void> => {
    const authenticatedRequest = req as AuthenticatedRequest;
    const instructorId = authenticatedRequest.user.id;
    const isVerified =
      await this._syncStripeStatusUseCase.execute(instructorId);
    ApiResponseHelper.success(res, 'Stripe status synchronized successfully', {
      isVerified,
    });
  };
}
