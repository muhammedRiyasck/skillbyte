import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IAdminRepository } from '../../domain/IRepositories/IAdminRepository';
import { Admin } from '../../domain/entities/Admin';
import { AdminModel, IAdmin } from '../models/AdminModel';
import { AdminMapper } from '../mappers/AdminMapper';

/** Manages database operations for admin. */
export class AdminRepository
  extends BaseRepository<Admin, IAdmin>
  implements IAdminRepository
{
  constructor() {
    super(AdminModel);
  }

  /**
   * To entity for the Admin entity.
   *
   * @param doc - The doc information.
   * @returns The result of the operation.
   */
  toEntity(doc: IAdmin): Admin {
    return AdminMapper.toEntity(doc);
  }

  // Override to exclude passwordHash as in original implementation
  /**
   * Find by id for the Admin entity.
   *
   * @param id - The unique identifier for the id.
   * @returns The result of the operation.
   */
  async findById(id: string): Promise<Admin | null> {
    const doc = await this.model.findById(id).select('-passwordHash');
    if (!doc) return null;
    return this.toEntity(doc);
  }

  // Find admin by email to support login functionality
  /**
   * Find by email for the Admin entity.
   *
   * @param email - The email information.
   * @returns The result of the operation.
   */
  async findByEmail(email: string): Promise<Admin | null> {
    const doc = await this.model.findOne({ email });
    if (!doc) return null;
    return this.toEntity(doc);
  }
}
