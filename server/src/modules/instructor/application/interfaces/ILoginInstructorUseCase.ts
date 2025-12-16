import { Instructor } from '../../domain/entities/Instructor';

export interface ILoginInstructorUseCase {
  execute(
    email: string,
    password: string,
  ): Promise<{ user: Instructor; accessToken: string; refreshToken: string }>;
}
