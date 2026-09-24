import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { IGetStudentProfileUseCase } from '../../application/interfaces/IGetStudentProfileUseCase';
import { IUpdateStudentProfileUseCase } from '../../application/interfaces/IUpdateStudentProfileUseCase';
import { IUploadStudentAvatarUseCase } from '../../application/interfaces/IUploadStudentAvatarUseCase';
import { IRemoveStudentAvatarUseCase } from '../../application/interfaces/IRemoveStudentAvatarUseCase';
import { IChangeStudentPasswordUseCase } from '../../application/interfaces/IChangeStudentPasswordUseCase';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { ChangeStudentPasswordDto } from '../../entry-points/validations/ChangeStudentPasswordValidation';

/** Handles HTTP requests for student profile operations. */
export class StudentProfileController {
  constructor(
    private readonly _getProfileUc: IGetStudentProfileUseCase,
    private readonly _updateProfileUc: IUpdateStudentProfileUseCase,
    private readonly _uploadAvatarUc: IUploadStudentAvatarUseCase,
    private readonly _removeAvatarUc: IRemoveStudentAvatarUseCase,
    private readonly _changePasswordUc: IChangeStudentPasswordUseCase,
  ) {}

  /**
   * Get profile for the StudentProfile entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  getProfile = async (req: Request, res: Response): Promise<void> => {
    const studentId = (req as AuthenticatedRequest).user.id;
    const student = await this._getProfileUc.execute(studentId);
    if (!student) {
      throw new HttpError('Student not found', HttpStatusCode.NOT_FOUND);
    }
    ApiResponseHelper.success(res, 'Student profile retrieved successfully', {
      student,
    });
  };

  /**
   * Update profile for the StudentProfile entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    const studentId = (req as AuthenticatedRequest).user.id;
    const {
      name,
      headline,
      bio,
      phoneNumber,
      timezone,
      location,
      socialLinks,
      interests,
      experienceLevel,
      learningGoals,
    } = req.body;

    await this._updateProfileUc.execute(studentId, {
      name,
      headline,
      bio,
      phoneNumber,
      timezone,
      location,
      socialLinks,
      interests,
      experienceLevel,
      learningGoals,
    });
    ApiResponseHelper.success(res, 'Profile updated successfully');
  };

  /**
   * Upload profile image for the StudentProfile entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  uploadProfileImage = async (req: Request, res: Response): Promise<void> => {
    const studentId = (req as AuthenticatedRequest).user.id;
    const file = (req as AuthenticatedRequest).file;
    if (!file) {
      throw new HttpError(
        ERROR_MESSAGES.NO_FILE_UPLOADED,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const url = await this._uploadAvatarUc.execute(studentId, file.path);
    ApiResponseHelper.success(res, 'Profile image uploaded successfully', {
      url,
    });
  };

  /**
   * Remove profile image for the StudentProfile entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  removeProfileImage = async (req: Request, res: Response): Promise<void> => {
    const studentId = (req as AuthenticatedRequest).user.id;
    await this._removeAvatarUc.execute(studentId);
    ApiResponseHelper.success(res, 'Profile image removed');
  };

  /**
   * Change password for the StudentProfile entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  changePassword = async (req: Request, res: Response): Promise<void> => {
    const studentId = (req as AuthenticatedRequest).user.id;
    const dto = req.body as ChangeStudentPasswordDto;
    await this._changePasswordUc.execute(studentId, dto);
    ApiResponseHelper.success(res, 'Password changed successfully');
  };
}
