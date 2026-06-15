import { ForgotPasswordRequestDto } from '../dtos/ForgotPasswordRequestDto';

export interface IForgotPasswordUseCase {
  execute(dto: ForgotPasswordRequestDto): Promise<false | void>;
}
