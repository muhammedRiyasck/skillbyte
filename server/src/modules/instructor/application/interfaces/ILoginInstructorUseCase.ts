import { Instructor } from '../../domain/entities/Instructor';
import { LoginRequestDto } from '../../../auth/application/dtos/LoginRequestDto';

export interface ILoginInstructorUseCase {
  execute(
    dto: LoginRequestDto,
  ): Promise<{ user: Instructor; accessToken: string; refreshToken: string }>;
}
