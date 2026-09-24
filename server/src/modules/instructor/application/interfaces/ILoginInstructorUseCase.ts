import { AuthResponseDto } from '../../../auth/application/dtos/AuthResponseDto';
import { LoginRequestDto } from '../../../auth/application/dtos/LoginRequestDto';

export interface ILoginInstructorUseCase {
  execute(dto: LoginRequestDto): Promise<{
    user: AuthResponseDto;
    accessToken: string;
    refreshToken: string;
  }>;
}
