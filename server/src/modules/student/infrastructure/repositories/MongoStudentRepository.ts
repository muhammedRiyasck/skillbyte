import { IStudentRepository } from '../../domain/IRepositories/IStudentRepository';
import { Student } from '../../domain/entities/Student';
import { StudentModel } from '../models/StudentModel';

export class MongoStudentRepository implements IStudentRepository {
  async save(student: Student): Promise<void> {
    try {
      // Check if student already exists
    await StudentModel.create(student);
      
    } catch (error) {
      console.error("Error saving student:", error);
      throw new Error('Failed to save student');
    }
  }

  async findByEmail(email: string): Promise<Student | null> {
    const doc = await StudentModel.findOne({ email }).select('-passwordHash');
    if (!doc) return null;
    return new Student(
      doc.name,
      doc.email,
      doc.passwordHash,
      doc.isEmailVerified,
      doc.registeredVia,
      doc.profilePictureUrl,
      doc.accountStatus,
    );
  }

  async findById(id: string): Promise<Student | null> {
            
    const doc = await StudentModel.findById(id);
    if (!doc) return null;
    return new Student(
      doc.name,
      doc.email,
      doc.passwordHash,
      doc.isEmailVerified,
    );
  }

  async findAll(): Promise<Student[]> {
    const docs = await StudentModel.find({});
    return docs.map(
      (doc) =>
        new Student(doc.name, doc.email, doc.passwordHash, doc.isEmailVerified),
    );
  }

  async changeStatus(id: string, status: "active" | "blocked"): Promise<void> {
  await StudentModel.findByIdAndUpdate(id, { accountStatus: status });
}

}
