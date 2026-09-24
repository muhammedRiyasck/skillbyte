import { InstructorProfileUpdateRequestDto } from '../dtos/InstructorRequestDto';

export interface IUpdateInstructorProfileUseCase {
  execute(id: string, dto: InstructorProfileUpdateRequestDto): Promise<void>;
}
