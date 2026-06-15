import { LoginAdminRequestDto } from '../dtos/AdminRequestDto';
import { LoginAdminResponseDto } from '../dtos/AdminResponseDto';

export interface ILoginAdminUseCase {
  execute(dto: LoginAdminRequestDto): Promise<LoginAdminResponseDto>;
}
