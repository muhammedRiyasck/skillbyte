import { IStudentRepository } from '../../domain/IRepositories/IStudentRepository';
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';
import { IUploadStudentAvatarUseCase } from '../interfaces/IUploadStudentAvatarUseCase';
import logger from '../../../../shared/utils/Logger';

/** Executes the business logic for upload student avatar. */
export class UploadStudentAvatarUseCase implements IUploadStudentAvatarUseCase {
  constructor(
    private readonly _studentRepo: IStudentRepository,
    private readonly _storageService: IStorageService,
  ) {}

  /**
   * Execute for the UploadStudentAvatar entity.
   *
   * @param studentId - The unique identifier for the student.
   * @param filePath - The file path information.
   * @returns The result of the operation.
   */
  async execute(studentId: string, filePath: string): Promise<string> {
    const student = await this._studentRepo.findById(studentId);
    if (student?.profilePictureUrl) {
      try {
        const oldPicId = this._storageService.getIdentifierFromUrl(
          student.profilePictureUrl,
        );
        await this._storageService.delete(oldPicId);
      } catch (error) {
        logger.error(
          'Failed to delete old student profile picture from cloud:',
          error,
        );
      }
    }

    const url = await this._storageService.upload(filePath, {
      folder: 'student-profiles',
    });

    await this._studentRepo.updateProfile(studentId, {
      profilePictureUrl: url,
    });
    return url;
  }
}
