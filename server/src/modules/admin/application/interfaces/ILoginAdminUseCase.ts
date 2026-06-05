import LoginAdminDTO from '../dtos/LoginAdminDTO';
import { LoginAdminResponseDTO } from '../dtos/LoginAdminResponseDTO';

export interface ILoginAdminUseCase {
  execute(dto: LoginAdminDTO): Promise<LoginAdminResponseDTO>;
}
