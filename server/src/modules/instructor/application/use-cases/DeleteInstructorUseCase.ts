import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { IDeleteInstructorUseCase } from '../interfaces/IDeleteInstructorUseCase';
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';

/** Executes the business logic for delete instructor. */
export class DeleteInstructorUseCase implements IDeleteInstructorUseCase {
  /**
   * Constructs the DeleteInstructorUseCase.
   * @param repo - The instructor repository for data operations.
   */
  constructor(
    private _instructorRepo: IInstructorRepository,
    private _storageService: IStorageService,
  ) {}

  /**
   * Execute for the DeleteInstructor entity.
   *
   * @param id - The unique identifier for the id.
   */
  async execute(id: string): Promise<void> {
    const instructor = await this._instructorRepo.findById(id);

    if (instructor) {
      if (instructor.resumeUrl) {
        try {
          const resumeId = this._storageService.getIdentifierFromUrl(
            instructor.resumeUrl,
          );
          await this._storageService.delete(resumeId);
        } catch (error) {
          console.error(
            `Failed to delete cloud resume for instructor ${id}:`,
            error,
          );
        }
      }

      if (instructor.profilePictureUrl) {
        try {
          const profilePicId = this._storageService.getIdentifierFromUrl(
            instructor.profilePictureUrl,
          );
          await this._storageService.delete(profilePicId);
        } catch (error) {
          console.error(
            `Failed to delete cloud profile picture for instructor ${id}:`,
            error,
          );
        }
      }
    }

    await this._instructorRepo.deleteById(id);
  }
}
