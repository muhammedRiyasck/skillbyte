import { InstructorResponseDto } from '../dtos/InstructorResponseDto';

export interface IGetInstructorProfileUseCase {
  execute(id: string): Promise<InstructorResponseDto | null>;
}
