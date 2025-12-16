import { Instructor } from '../../domain/entities/Instructor';

export interface IReapplyInstructorUseCase {
  execute(
    id: string,
    updates: Partial<Instructor>,
    resumeFile?: Express.Multer.File,
  ): Promise<void>;
}
