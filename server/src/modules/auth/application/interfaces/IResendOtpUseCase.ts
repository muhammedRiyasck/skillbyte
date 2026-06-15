import { ResendOtpRequestDto } from '../dtos/ResendOtpRequestDto';

export interface IResendOtpUseCase {
  execute(dto: ResendOtpRequestDto): Promise<void>;
}
