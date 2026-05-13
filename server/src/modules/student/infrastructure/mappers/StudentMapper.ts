import { Student } from '../../domain/entities/Student';
import { IStudent as IStudentDocument } from '../models/StudentModel';

export class StudentMapper {
  static toEntity(doc: IStudentDocument): Student {
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
}
