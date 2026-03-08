import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IStudentRepository } from '../../domain/IRepositories/IStudentRepository';
import { Student } from '../../domain/entities/Student';
import { StudentModel, IStudent } from '../models/StudentModel';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { StudentMapper } from '../../application/mappers/StudentMapper';

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
}
