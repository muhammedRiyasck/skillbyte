import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';
import { IUploadInstructorAvatarUseCase } from '../interfaces/IUploadInstructorAvatarUseCase';
import logger from '../../../../shared/utils/Logger';

/** Executes the business logic for upload instructor avatar. */
export class UploadInstructorAvatarUseCase
  implements IUploadInstructorAvatarUseCase
{
  constructor(
    private readonly _instructorRepo: IInstructorRepository,
    private readonly _storageService: IStorageService,
  ) {}

  /**
   * Execute for the UploadInstructorAvatar entity.
   *
   * @param instructorId - The unique identifier for the instructor.
   * @param filePath - The file path information.
   * @returns The result of the operation.
   */
  async execute(instructorId: string, filePath: string): Promise<string> {
    const instructor = await this._instructorRepo.findById(instructorId);
    if (instructor?.profilePictureUrl) {
      try {
        const oldPicId = this._storageService.getIdentifierFromUrl(
          instructor.profilePictureUrl,
        );
        await this._storageService.delete(oldPicId);
      } catch (error) {
        logger.error(
          'Failed to delete old instructor profile picture from cloud:',
          error,
        );
      }
    }

    const url = await this._storageService.upload(filePath, {
      folder: 'instructor-profiles',
    });

    await this._instructorRepo.updateById(instructorId, {
      profilePictureUrl: url,
    });
    return url;
  }
}
