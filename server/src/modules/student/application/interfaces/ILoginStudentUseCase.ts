import { Student } from '../../domain/entities/Student';
import { LoginRequestDto } from '../../../auth/application/dtos/LoginRequestDto';

export interface ILoginStudentUseCase {
  execute(
    dto: LoginRequestDto,
  ): Promise<{ user: Student; accessToken: string; refreshToken: string }>;
}
