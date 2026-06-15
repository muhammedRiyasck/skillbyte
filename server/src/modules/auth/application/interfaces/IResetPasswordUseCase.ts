import { ResetPasswordRequestDto } from '../dtos/ResetPasswordRequestDto';

export interface IResetPasswordUseCase {
  execute(dto: ResetPasswordRequestDto): Promise<void>;
}
