import { IAdminRepository } from '../../domain/IRepositories/IAdminRepository';
import { Admin } from '../../domain/entities/Admin';
import { AdminModel } from '../models/AdminModel';
export class AdminRepository implements IAdminRepository {
  async findById(id: string): Promise<Admin | null> {
    const admin = await AdminModel.findById(id).select('-passwordHash');
    if (!admin) return null;
    return new Admin(
      admin.name,
      admin.email,
      '',
      admin.role,
      admin.isEmailVerified,
      admin.accountStatus,
      admin.profilePictureUrl,
      admin._id.toString(),
    );
  }

  // Find admin by email to support login functionality
  async findByEmail(email: string): Promise<Admin | null> {
    const admin = await AdminModel.findOne({ email });
    if (!admin) return null;
    return new Admin(
      admin.name,
      admin.email,
      admin.passwordHash,
      admin.role,
      admin.isEmailVerified,
      admin.accountStatus,
      admin.profilePictureUrl,
      admin._id.toString(),
    );
  }
}
