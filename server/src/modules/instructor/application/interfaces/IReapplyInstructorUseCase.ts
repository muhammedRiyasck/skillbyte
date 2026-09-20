import { Instructor } from '../../domain/entities/Instructor';

export interface IReapplyInstructorUseCase {
  execute(
    email: string,
    updates: Partial<Instructor>,
    resumeFile?: Express.Multer.File,
  ): Promise<void>;
}
