import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { HttpError } from '../../../../shared/types/HttpError';
import { IStudentRepository } from '../../domain/IRepositories/IStudentRepository';
import { Student } from '../../domain/entities/Student';
import { StudentModel } from '../models/StudentModel';

export class StudentRepository implements IStudentRepository {
  async save(student: Student): Promise<void> {
    try {
      // Check if student already exists
      await StudentModel.create(student);
    } catch (error) {
      console.error('Error saving student:', error);
      throw new HttpError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Find admin by email to support login functionality
  async findByEmail(email: string): Promise<Student | null> {
    const doc = await StudentModel.findOne({ email });
    if (!doc) return null;
    return new Student(
      doc.name,
      doc.email,
      doc.passwordHash,
      doc.isEmailVerified,
      doc.registeredVia,
      doc.profilePictureUrl,
      doc.accountStatus,
      doc._id.toString(),
    );
  }

  async findById(id: string): Promise<Student | null> {
    const doc = await StudentModel.findById(id).select('-passwordHash');
    if (!doc) return null;
    return new Student(
      doc.name,
      doc.email,
      doc.passwordHash,
      doc.isEmailVerified,
      doc.registeredVia,
      doc.profilePictureUrl,
    );
  }

  async findByIdAndUpdatePassword(
    id: string,
    passwordHash: string,
  ): Promise<{ name: string; email: string } | void> {
    try {
      const doc = await StudentModel.findByIdAndUpdate(
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

  async findAll(): Promise<Student[]> {
    const docs = await StudentModel.find({}).select('-passwordHash');
    // console.log('find called',docs)
    return docs.map(
      (doc) =>
        new Student(
          doc.name,
          doc.email,
          '',
          doc.isEmailVerified,
          doc.registeredVia,
          doc.profilePictureUrl,
          doc.accountStatus,
          doc._id.toString(),
        ),
    );
  }

  async changeStatus(id: string, status: 'active' | 'blocked'): Promise<void> {
    await StudentModel.findByIdAndUpdate(id, { accountStatus: status });
  }

  async listPaginated(
    filter: Record<string, unknown>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1> = { createdAt: -1 },
  ): Promise<{ data: Student[]; total: number }> {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(limit, 50);
    const skip = (safePage - 1) * safeLimit;

    const [rawData, total] = await Promise.all([
      StudentModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(safeLimit)
        .select('-passwordHash')
        .lean(),
      StudentModel.countDocuments(filter),
    ]);

    const data: Student[] = rawData.map(
      (doc) =>
        new Student(
          doc.name,
          doc.email,
          '',
          doc.isEmailVerified,
          doc.registeredVia,
          doc.profilePictureUrl,
          doc.accountStatus,
          doc._id.toString(),
        ),
    );

    return { data, total };
  }
}
