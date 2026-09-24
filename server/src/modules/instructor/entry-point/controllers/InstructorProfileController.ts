import { Response, Request } from 'express';
import { IGetInstructorProfileUseCase } from '../../application/interfaces/IGetInstructorProfileUseCase';
import { IUpdateInstructorProfileUseCase } from '../../application/interfaces/IUpdateInstructorProfileUseCase';
import { CreateStripeOnboardingLinkUseCase } from '../../application/use-cases/CreateStripeOnboardingLinkUseCase';
import { ISyncStripeAccountStatusUseCase } from '../../application/interfaces/ISyncStripeAccountStatusUseCase';
import { IUploadInstructorAvatarUseCase } from '../../application/interfaces/IUploadInstructorAvatarUseCase';
import { IRemoveInstructorAvatarUseCase } from '../../application/interfaces/IRemoveInstructorAvatarUseCase';
import { IChangeInstructorPasswordUseCase } from '../../application/interfaces/IChangeInstructorPasswordUseCase';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { HttpError } from '../../../../shared/types/HttpError';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { InstructorProfileUpdateRequestDto } from '../../application/dtos/InstructorRequestDto';
import { ChangeInstructorPasswordDto } from '../../entry-point/validations/ChangeInstructorPasswordValidation';

/** Handles HTTP requests for instructor profile operations. */
export class InstructorProfileController {
  constructor(
    private readonly _getInstructorProfileUseCase: IGetInstructorProfileUseCase,
    private readonly _updateInstructorProfileUseCase: IUpdateInstructorProfileUseCase,
    private readonly _createStripeOnboardingLinkUseCase: CreateStripeOnboardingLinkUseCase,
    private readonly _syncStripeStatusUseCase: ISyncStripeAccountStatusUseCase,
    private readonly _uploadAvatarUc: IUploadInstructorAvatarUseCase,
    private readonly _removeAvatarUc: IRemoveInstructorAvatarUseCase,
    private readonly _changePasswordUc: IChangeInstructorPasswordUseCase,
  ) {}

  /**
   * Get profile for the InstructorProfile entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
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

  /**
   * Update profile for the InstructorProfile entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    const authenticatedRequest = req as AuthenticatedRequest;
    const instructorId = authenticatedRequest.user.id;
    const dto: InstructorProfileUpdateRequestDto = req.body;

    await this._updateInstructorProfileUseCase.execute(instructorId, dto);
    ApiResponseHelper.success(res, 'Profile updated successfully');
  };

  /**
   * Upload profile image for the InstructorProfile entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
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

  /**
   * Remove profile image for the InstructorProfile entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  removeProfileImage = async (req: Request, res: Response): Promise<void> => {
    const authenticatedRequest = req as AuthenticatedRequest;
    const instructorId = authenticatedRequest.user.id;
    await this._removeAvatarUc.execute(instructorId);
    ApiResponseHelper.success(res, 'Profile image removed');
  };

  /**
   * Create stripe onboarding link for the InstructorProfile entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
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

  /**
   * Sync stripe status for the InstructorProfile entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  syncStripeStatus = async (req: Request, res: Response): Promise<void> => {
    const authenticatedRequest = req as AuthenticatedRequest;
    const instructorId = authenticatedRequest.user.id;
    const isVerified =
      await this._syncStripeStatusUseCase.execute(instructorId);
    ApiResponseHelper.success(res, 'Stripe status synchronized successfully', {
      isVerified,
    });
  };

  /**
   * Change password for the InstructorProfile entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  changePassword = async (req: Request, res: Response): Promise<void> => {
    const authenticatedRequest = req as AuthenticatedRequest;
    const instructorId = authenticatedRequest.user.id;
    const dto = req.body as ChangeInstructorPasswordDto;
    await this._changePasswordUc.execute(instructorId, dto);
    ApiResponseHelper.success(res, 'Password changed successfully');
  };
}
