import { Admin } from "../../domain/entities/Admin";
import LoginAdminDTO from "../dtos/LoginAdminDTO ";

export interface ILoginAdminUseCase {
  execute(dto: LoginAdminDTO): Promise<{ admin: Admin; accessToken: string; refreshToken: string }>; // or a specific DTO type
}
