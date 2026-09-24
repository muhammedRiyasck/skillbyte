import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IStudentRepository } from '../../domain/IRepositories/IStudentRepository';
import { Student } from '../../domain/entities/Student';
import { StudentModel, IStudent } from '../models/StudentModel';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { StudentMapper } from '../mappers/StudentMapper';
import { SocketService } from '../../../../shared/services/socket/SocketService';

/** Manages database operations for student. */
export class StudentRepository
  extends BaseRepository<Student, IStudent>
  implements IStudentRepository
{
  constructor() {
    super(StudentModel);
  }

  /**
   * To entity for the Student entity.
   *
   * @param doc - The doc information.
   * @returns The result of the operation.
   */
  toEntity(doc: IStudent): Student {
    return StudentMapper.toEntity(doc);
  }

  /**
   * Find by email for the Student entity.
   *
   * @param email - The email information.
   * @returns The result of the operation.
   */
  async findByEmail(email: string): Promise<Student | null> {
    const doc = await this.model.findOne({ email });
    if (!doc) return null;
    return this.toEntity(doc);
  }

  /**
   * Find by ids for the Student entity.
   *
   * @param ids - The unique identifier for the ids.
   * @returns The result of the operation.
   */
  async findByIds(ids: string[]): Promise<Student[]> {
    if (!ids.length) return [];

    const docs = await this.model
      .find({ _id: { $in: ids } })
      .select(
        'name email profilePictureUrl isEmailVerified registeredVia accountStatus',
      );

    return docs.map((doc) => this.toEntity(doc));
  }

  /**
   * Find by id and update password for the Student entity.
   *
   * @param id - The unique identifier for the id.
   * @param passwordHash - The password hash information.
   * @returns The result of the operation.
   */
  async findByIdAndUpdatePassword(
    id: string,
    passwordHash: string,
  ): Promise<{ name: string; email: string } | void> {
    try {
      const doc = await this.model.findByIdAndUpdate(
        { _id: id },
        { passwordHash },
      );
      if (doc) return { name: doc.name, email: doc.email };
      else return;
    } catch (error) {
      console.error('Error saving student:', error);
      throw new HttpError(
        'Failed to reset password for student',
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Change status for the Student entity.
   *
   * @param id - The unique identifier for the id.
   * @param status - The status information.
   */
  async changeStatus(id: string, status: 'active' | 'blocked'): Promise<void> {
    await this.model.findByIdAndUpdate(id, { accountStatus: status });
  }

  /**
   * Update profile for the Student entity.
   *
   * @param id - The unique identifier for the id.
   * @param updates - The updates information.
   */
  async updateProfile(id: string, updates: Partial<Student>): Promise<void> {
    const doc: Record<string, unknown> = {};
    if (updates.name !== undefined) doc.name = updates.name;
    if (updates.profilePictureUrl !== undefined)
      doc.profilePictureUrl = updates.profilePictureUrl;
    if (updates.headline !== undefined) doc.headline = updates.headline;
    if (updates.bio !== undefined) doc.bio = updates.bio;
    if (updates.phoneNumber !== undefined)
      doc.phoneNumber = updates.phoneNumber;
    if (updates.timezone !== undefined) doc.timezone = updates.timezone;
    if (updates.location !== undefined) doc.location = updates.location;
    if (updates.socialLinks !== undefined)
      doc.socialLinks = updates.socialLinks;
    if (updates.interests !== undefined) doc.interests = updates.interests;
    if (updates.experienceLevel !== undefined)
      doc.experienceLevel = updates.experienceLevel;
    if (updates.learningGoals !== undefined)
      doc.learningGoals = updates.learningGoals;
    if (updates.xp !== undefined) doc.xp = updates.xp;
    if (updates.currentStreak !== undefined)
      doc.currentStreak = updates.currentStreak;

    await this.model.findByIdAndUpdate(id, { $set: doc });
  }

  /**
   * Record activity for the Student entity.
   *
   * @param id - The unique identifier for the id.
   * @param xpEarned - The xp earned information.
   * @returns The result of the operation.
   */
  async recordActivity(id: string, xpEarned: number = 0): Promise<Student> {
    const updated = await this.model.findByIdAndUpdate(
      id,
      { $inc: { xp: xpEarned } },
      { new: true, runValidators: true },
    );
    if (!updated) {
      throw new HttpError('Student not found', HttpStatusCode.NOT_FOUND);
    }

    // Emit real-time XP notification
    if (xpEarned > 0) {
      try {
        SocketService.getInstance().emitToUser(id, 'xp_earned', { xpEarned });
      } catch (err) {
        console.error('Failed to emit xp_earned socket event:', err);
      }
    }

    return this.toEntity(updated);
  }
}
