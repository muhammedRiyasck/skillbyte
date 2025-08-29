import { IAdminRepository } from '../../domain/IRepositories/IAdminRepository';
import LoginAdminDTO from '../dtos/LoginAdminDTO ';
import { Admin } from '../../domain/entities/Admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateAccessToken } from '../../../../shared/utils/AccessToken';
import { generateRefreshToken } from '../../../../shared/utils/RefreshToken';
export class LoginAdminUseCase {
  constructor(private adminRepo: IAdminRepository) {}

  async execute(
    dto: LoginAdminDTO,
  ): Promise<{ admin: any; accessToken: string; refreshToken: string }> {
    const admin = await this.adminRepo.findByEmail(dto.email);
    if (!admin) {
      const error = new Error('Invalid credentials') as any;
      error.status = 400;
      throw error;
    }

    const isMatch = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!isMatch) throw new Error('Invalid credentials');

    const isActive = admin.accountStatus === 'blocked';
    if (isActive)
      throw new Error('Account is Blocked. Please contact support.');

    const accessToken = generateAccessToken({ id: admin._id, role: 'admin' });
    const refreshToken = generateRefreshToken({ id: admin._id, role: 'admin' });

    return { admin, accessToken, refreshToken };
  }
}
