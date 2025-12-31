import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IAdminRepository } from '../../domain/IRepositories/IAdminRepository';
import { Admin } from '../../domain/entities/Admin';
import { AdminModel, IAdmin } from '../models/AdminModel';

export class AdminRepository
  extends BaseRepository<Admin, IAdmin>
  implements IAdminRepository
{
  constructor() {
    super(AdminModel);
  }

  toEntity(doc: IAdmin): Admin {
    return new Admin(
      doc.name,
      doc.email,
      doc.passwordHash || '',
      doc.role,
      doc.isEmailVerified,
      doc.accountStatus,
      doc.profilePictureUrl,
      doc._id.toString(),
    );
  }

  // Override to exclude passwordHash as in original implementation
  async findById(id: string): Promise<Admin | null> {
    const doc = await this.model.findById(id).select('-passwordHash');
    if (!doc) return null;
    return this.toEntity(doc);
  }

  // Find admin by email to support login functionality
  async findByEmail(email: string): Promise<Admin | null> {
    const doc = await this.model.findOne({ email });
    if (!doc) return null;
    return this.toEntity(doc);
  }
}
