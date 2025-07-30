import { IAdminRepository } from '../../domain/IRepositories/IAdminRepository';
import LoginAdminDTO from '../dtos/LoginAdminDTO ';
import {Admin} from '../../domain/entities/Admin'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
export class LoginAdminUseCase {
  constructor(private adminRepo: IAdminRepository) {}

  async execute(dto: LoginAdminDTO): Promise<{admin:any,token:string}> {
    const admin = await this.adminRepo.findByEmail(dto.email);
    if (!admin) throw new Error('Invalkid credentials');

    const isMatch = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!isMatch) throw new Error('Invalid credentials');

    const isActive = admin.accountStatus === 'blocked';
    if (!isActive)
      throw new Error('Account is Blocked. Please contact support.');

    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' },
    );
    return {admin,token};
  }

}
