import { InstructorModel } from "../models/InstructorModel";
import { IInstructorRepository } from "../../domain/IRepositories/IinstructorRepository";
import { Instructor } from "../../domain/entities/Instructor";
import { InstructorMapper } from "../../mappers/InstructorMapper";

export class MongoInstructorRepository implements IInstructorRepository {
  async save(instructor: Instructor): Promise<void> {
    const data = InstructorMapper.toPersistence(instructor);
    await InstructorModel.create(data);
  }

  async findByEmail(email: string): Promise<Instructor | null> {
    const doc = await InstructorModel.findOne({ email });
    if (!doc) return null;
    return InstructorMapper.toEntity(doc);
  }

  async findById(id: string): Promise<Instructor | null> {
    const doc = await InstructorModel.findById(id);
    if (!doc) return null;
    return InstructorMapper.toEntity(doc);
  }

  async findByIdAndUpdatePassword(id: string, passwordHash: string): Promise<{name:string,email:string}|void> {
      try {
        
        const doc = await InstructorModel.findByIdAndUpdate({_id:id},{passwordHash})
        if(doc) return {name:doc.name,email:doc.email}
        else return 
      } catch (error) {
        console.error("Error saving student:", error);
        throw new Error('Failed to resent password student');
      }
    }

  async listPending(): Promise<Instructor[] | null> {
    const docs = await InstructorModel.find({ approved: false });
    if (!docs || docs.length === 0) return null;
    return docs.map(doc => InstructorMapper.toEntity(doc));
  }

async approve(id: string, adminId: string): Promise<void> {
  await InstructorModel.findByIdAndUpdate(id, {
    accountStatus: "active",
    approved: true,
    approvedBy: adminId,
    approvedAt: new Date()
  });
}

async decline(id: string, note: string): Promise<void> {
  await InstructorModel.findByIdAndUpdate(id, {
    accountStatus: "rejected",
    approvalNotes: note,
    rejected: true
  });
}

async findAllApproved(): Promise<Instructor[]|null> {
  const docs = await InstructorModel.find({ approved: true });
  if(!docs) return null
  return docs.map(doc => InstructorMapper.toEntity(doc));
}

async changeStatus(id: string, status: "active" | "suspended"): Promise<void> {
  await InstructorModel.findByIdAndUpdate(id, { accountStatus: status });
}

 
}

