import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IStudentRepository } from '../../domain/IRepositories/IStudentRepository';
import { Student } from '../../domain/entities/Student';
import { StudentModel, IStudent } from '../models/StudentModel';

export class StudentRepository
  extends BaseRepository<Student, IStudent>
  implements IStudentRepository
{
  constructor() {
    super(StudentModel);
  }

  toEntity(doc: IStudent): Student {
    return new Student(
      doc.name,
      doc.email,
      doc.passwordHash || '',
      doc.isEmailVerified,
      doc.registeredVia,
      doc.profilePictureUrl,
      doc.accountStatus,
      doc._id.toString(),
    );
  }

  async findByEmail(email: string): Promise<Student | null> {
    const doc = await this.model.findOne({ email });
    if (!doc) return null;
    return this.toEntity(doc);
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
      throw new Error('Failed to resent password student');
    }
  }

  async changeStatus(id: string, status: 'active' | 'blocked'): Promise<void> {
    await this.model.findByIdAndUpdate(id, { accountStatus: status });
  }
}
