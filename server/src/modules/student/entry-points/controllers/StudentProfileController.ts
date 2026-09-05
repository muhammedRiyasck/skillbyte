import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { IGetStudentProfileUseCase } from '../../application/interfaces/IGetStudentProfileUseCase';
import { IUpdateStudentProfileUseCase } from '../../application/interfaces/IUpdateStudentProfileUseCase';
import { IUploadStudentAvatarUseCase } from '../../application/interfaces/IUploadStudentAvatarUseCase';
import { IRemoveStudentAvatarUseCase } from '../../application/interfaces/IRemoveStudentAvatarUseCase';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';

/**
 * Controller for student profile operations.
 * Pure HTTP routing layer delegating all business logic to focused use cases.
 */
export class StudentProfileController {
  constructor(
    private readonly _getProfileUc: IGetStudentProfileUseCase,
    private readonly _updateProfileUc: IUpdateStudentProfileUseCase,
    private readonly _uploadAvatarUc: IUploadStudentAvatarUseCase,
    private readonly _removeAvatarUc: IRemoveStudentAvatarUseCase,
  ) {}

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

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    const studentId = (req as AuthenticatedRequest).user.id;
    const { name } = req.body as { name: string };
    await this._updateProfileUc.execute(studentId, { name });
    ApiResponseHelper.success(res, 'Profile updated successfully');
  };

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

  removeProfileImage = async (req: Request, res: Response): Promise<void> => {
    const studentId = (req as AuthenticatedRequest).user.id;
    await this._removeAvatarUc.execute(studentId);
    ApiResponseHelper.success(res, 'Profile image removed');
  };
}
