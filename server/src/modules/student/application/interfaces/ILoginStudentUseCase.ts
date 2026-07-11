import { StudentResponseDto } from '../dtos/StudentResponseDto';
import { LoginRequestDto } from '../../../auth/application/dtos/LoginRequestDto';

export interface ILoginStudentUseCase {
  execute(dto: LoginRequestDto): Promise<{
    user: StudentResponseDto;
    accessToken: string;
    refreshToken: string;
  }>;
}
