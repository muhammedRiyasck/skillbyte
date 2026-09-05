import { IStudentRepository } from '../../domain/IRepositories/IStudentRepository';
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';
import { IRemoveStudentAvatarUseCase } from '../interfaces/IRemoveStudentAvatarUseCase';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import logger from '../../../../shared/utils/Logger';

export class RemoveStudentAvatarUseCase implements IRemoveStudentAvatarUseCase {
  constructor(
    private readonly _studentRepo: IStudentRepository,
    private readonly _storageService: IStorageService,
  ) {}

  async execute(studentId: string): Promise<void> {
    const student = await this._studentRepo.findById(studentId);
    if (!student) {
      throw new HttpError('Student not found', HttpStatusCode.NOT_FOUND);
    }

    if (student.profilePictureUrl) {
      try {
        const publicId = this._storageService.getIdentifierFromUrl(
          student.profilePictureUrl,
        );
        await this._storageService.delete(publicId);
      } catch (error) {
        logger.error('Failed to delete student image from cloud:', error);
      }
      await this._studentRepo.updateProfile(studentId, {
        profilePictureUrl: null,
      });
    }
  }
}
