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

  // Find admin by email to support login functionality
  async findByEmail(email: string): Promise<Student | null> {
    const doc = await StudentModel.findOne({ email })
    if (!doc) return null;
    return new Student(
      doc.name,
      doc.email,
      doc.passwordHash,
      doc.isEmailVerified,
      doc.registeredVia,
      doc.profilePictureUrl,
      doc.accountStatus,
      doc._id.toString()
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

  async findByIdAndUpdatePassword(id: string, passwordHash: string): Promise<{name:string,email:string}|void> {
    try {
      
      const doc = await StudentModel.findByIdAndUpdate({_id:id},{passwordHash})
      if(doc) return {name:doc.name,email:doc.email}
      else return 
    } catch (error) {
      console.error("Error saving student:", error);
      throw new Error('Failed to resent password student');
    }
  }

  async findAll(): Promise<Student[]> {
    console.log('find called')
    const docs = await StudentModel.find({}).select('-passwordHash');
    // console.log('find called',docs)
    return docs.map(
      (doc) =>
        new Student(doc.name, doc.email,'', doc.isEmailVerified,doc.registeredVia,doc.profilePictureUrl,doc.accountStatus,doc._id.toString() ),
    );
  }

  async changeStatus(id: string, status: "active" | "blocked"): Promise<void> {
  await StudentModel.findByIdAndUpdate(id, { accountStatus: status });
}

}
