import { InstructorReapplyRequestDto } from '../dtos/InstructorRequestDto';

export interface IReapplyInstructorUseCase {
  execute(
    dto: InstructorReapplyRequestDto,
    resumeFile?: Express.Multer.File,
  ): Promise<void>;
}
