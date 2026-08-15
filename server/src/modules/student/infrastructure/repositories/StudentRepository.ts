import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IStudentRepository } from '../../domain/IRepositories/IStudentRepository';
import { Student } from '../../domain/entities/Student';
import { StudentModel, IStudent } from '../models/StudentModel';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { StudentMapper } from '../mappers/StudentMapper';

export class StudentRepository
  extends BaseRepository<Student, IStudent>
  implements IStudentRepository
{
  constructor() {
    super(StudentModel);
  }

  toEntity(doc: IStudent): Student {
    return StudentMapper.toEntity(doc);
  }

  async findByEmail(email: string): Promise<Student | null> {
    const doc = await this.model.findOne({ email });
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findByIds(ids: string[]): Promise<Student[]> {
    if (!ids.length) return [];

    const docs = await this.model
      .find({ _id: { $in: ids } })
      .select(
        'name email profilePictureUrl isEmailVerified registeredVia accountStatus',
      );

    return docs.map((doc) => this.toEntity(doc));
  }

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

  async changeStatus(id: string, status: 'active' | 'blocked'): Promise<void> {
    await this.model.findByIdAndUpdate(id, { accountStatus: status });
  }

  async updateProfile(
    id: string,
    updates: Partial<Pick<Student, 'name' | 'profilePictureUrl'>>,
  ): Promise<void> {
    const doc: Record<string, unknown> = {};
    if (updates.name !== undefined) doc.name = updates.name;
    if (updates.profilePictureUrl !== undefined)
      doc.profilePictureUrl = updates.profilePictureUrl;
    await this.model.findByIdAndUpdate(id, doc);
  }
}
