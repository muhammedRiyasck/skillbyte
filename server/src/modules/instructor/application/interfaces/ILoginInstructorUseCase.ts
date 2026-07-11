import { InstructorResponseDto } from '../dtos/InstructorResponseDto';
import { LoginRequestDto } from '../../../auth/application/dtos/LoginRequestDto';

export interface ILoginInstructorUseCase {
  execute(dto: LoginRequestDto): Promise<{
    user: InstructorResponseDto;
    accessToken: string;
    refreshToken: string;
  }>;
}
