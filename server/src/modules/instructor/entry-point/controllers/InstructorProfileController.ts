import { Response, Request } from 'express';
import { IGetInstructorProfileUseCase } from '../../application/interfaces/IGetInstructorProfileUseCase';
import { IUpdateInstructorProfileUseCase } from '../../application/interfaces/IUpdateInstructorProfileUseCase';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import {
  uploadToCloudinary,
  getPublicIdFromUrl,
  deleteFromCloudinary,
} from '../../../../shared/utils/Cloudinary';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { HttpError } from '../../../../shared/types/HttpError';

/**
 * Controller for instructor profile operations.
 * Handles retrieving, updating, and managing profile images for instructors.
 */
export class InstructorProfileController {
  /**
   * Constructs the InstructorProfileController.
   * @param getInstructorProfileUseCase - Use case for retrieving instructor profiles.
   * @param updateInstructorProfileUseCase - Use case for updating instructor profiles.
   */
  constructor(
    private readonly getInstructorProfileUseCase: IGetInstructorProfileUseCase,
    private readonly updateInstructorProfileUseCase: IUpdateInstructorProfileUseCase,
  ) {}

  /**
   * Retrieves the profile of the authenticated instructor.
   * @param req - Authenticated request object.
   * @param res - Express response object.
   */
  getProfile = async (req: Request, res: Response): Promise<void> => {
    const AuthenticatedRequest = req as AuthenticatedRequest;
    const instructorId = AuthenticatedRequest.user.id;
    const instructor =
      await this.getInstructorProfileUseCase.execute(instructorId);
    if (!instructor) {
      throw new HttpError('Instructor not found', HttpStatusCode.NOT_FOUND);
    }
    ApiResponseHelper.success(
      res,
      'Instructor profile retrieved successfully',
      { instructor },
    );
  };

  /**
   * Updates the profile of the authenticated instructor.
   * @param req - Authenticated request object with update data in body.
   * @param res - Express response object.
   */
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    const AuthenticatedRequest = req as AuthenticatedRequest;
    const instructorId = AuthenticatedRequest.user.id;
    const updates = AuthenticatedRequest.body;
    await this.updateInstructorProfileUseCase.execute(instructorId, updates);
    ApiResponseHelper.success(res, 'Profile updated successfully');
  };

  /**
   * Uploads a profile image for the authenticated instructor.
   * @param req - Authenticated request object with file upload.
   * @param res - Express response object.
   */
  uploadProfileImage = async (req: Request, res: Response): Promise<void> => {
    const AuthenticatedRequest = req as AuthenticatedRequest;
    const file = AuthenticatedRequest.file;
    if (!file) {
      throw new HttpError('No file uploaded', HttpStatusCode.BAD_REQUEST);
    }

    const url = await uploadToCloudinary(file.path, {
      folder: 'instructor-profiles',
    });
    ApiResponseHelper.success(res, 'Profile image uploaded successfully', {
      url,
    });
  };

  /**
   * Removes the profile image of the authenticated instructor.
   * @param req - Authenticated request object.
   * @param res - Express response object.
   */
  removeProfileImage = async (req: Request, res: Response): Promise<void> => {
    const AuthenticatedRequest = req as AuthenticatedRequest;
    const instructorId = AuthenticatedRequest.user.id;
    const instructor =
      await this.getInstructorProfileUseCase.execute(instructorId);
    if (!instructor) {
      throw new HttpError('Instructor not found', HttpStatusCode.NOT_FOUND);
    }

    if (instructor.profilePictureUrl) {
      try {
        const publicId = getPublicIdFromUrl(instructor.profilePictureUrl);
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.error('Failed to delete image from cloud:', error);
        // Continue to update profile even if delete fails
      }
      await this.updateInstructorProfileUseCase.execute(instructorId, {
        profilePictureUrl: null,
      });
    }
    ApiResponseHelper.success(res, 'Profile image removed');
  };


}
