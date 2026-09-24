import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';
import { IRemoveInstructorAvatarUseCase } from '../interfaces/IRemoveInstructorAvatarUseCase';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import logger from '../../../../shared/utils/Logger';

/** Executes the business logic for remove instructor avatar. */
export class RemoveInstructorAvatarUseCase
  implements IRemoveInstructorAvatarUseCase
{
  constructor(
    private readonly _instructorRepo: IInstructorRepository,
    private readonly _storageService: IStorageService,
  ) {}

  /**
   * Execute for the RemoveInstructorAvatar entity.
   *
   * @param instructorId - The unique identifier for the instructor.
   */
  async execute(instructorId: string): Promise<void> {
    const instructor = await this._instructorRepo.findById(instructorId);
    if (!instructor) {
      throw new HttpError(
        ERROR_MESSAGES.INSTRUCTOR_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    if (instructor.profilePictureUrl) {
      try {
        const publicId = this._storageService.getIdentifierFromUrl(
          instructor.profilePictureUrl,
        );
        await this._storageService.delete(publicId);
      } catch (error) {
        logger.error('Failed to delete instructor image from cloud:', error);
      }
      await this._instructorRepo.updateById(instructorId, {
        profilePictureUrl: null,
      });
    }
  }
}
