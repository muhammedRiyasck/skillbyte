import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { IGetStudentProfileUseCase } from '../../application/interfaces/IGetStudentProfileUseCase';
import { IUpdateStudentProfileUseCase } from '../../application/interfaces/IUpdateStudentProfileUseCase';
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';

/**
 * Controller for student profile operations.
 * Handles retrieving, updating, and managing profile images for students.
 */
export class StudentProfileController {
  constructor(
    private readonly _getProfileUc: IGetStudentProfileUseCase,
    private readonly _updateProfileUc: IUpdateStudentProfileUseCase,
    private readonly _storageService: IStorageService,
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

    // Delete old image from Cloudinary if one exists
    const student = await this._getProfileUc.execute(studentId);
    if (student?.profilePicture) {
      try {
        const oldPicId = this._storageService.getIdentifierFromUrl(
          student.profilePicture,
        );
        await this._storageService.delete(oldPicId);
      } catch (error) {
        console.error(
          'Failed to delete old profile picture from cloud:',
          error,
        );
      }
    }

    const url = await this._storageService.upload(file.path, {
      folder: 'student-profiles',
    });
    await this._updateProfileUc.execute(studentId, { profilePictureUrl: url });
    ApiResponseHelper.success(res, 'Profile image uploaded successfully', {
      url,
    });
  };

  removeProfileImage = async (req: Request, res: Response): Promise<void> => {
    const studentId = (req as AuthenticatedRequest).user.id;
    const student = await this._getProfileUc.execute(studentId);
    if (!student) {
      throw new HttpError('Student not found', HttpStatusCode.NOT_FOUND);
    }

    if (student.profilePicture) {
      try {
        const publicId = this._storageService.getIdentifierFromUrl(
          student.profilePicture,
        );
        await this._storageService.delete(publicId);
      } catch (error) {
        console.error('Failed to delete image from cloud:', error);
      }
      await this._updateProfileUc.execute(studentId, {
        profilePictureUrl: null,
      });
    }
    ApiResponseHelper.success(res, 'Profile image removed');
  };
}
