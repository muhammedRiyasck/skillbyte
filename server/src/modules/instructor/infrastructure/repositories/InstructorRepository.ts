import { InstructorModel } from '../models/InstructorModel';
import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { Instructor } from '../../domain/entities/Instructor';
import { InstructorMapper } from '../../mappers/InstructorMapper';
import { Types } from 'mongoose';
import { HttpError } from '../../../../shared/types/HttpError';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import logger from '../../../../shared/utils/Logger';

export class InstructorRepository implements IInstructorRepository {
  async save(instructor: Instructor): Promise<Instructor> {
    const data = InstructorMapper.toPersistence(instructor);
    const doc = await InstructorModel.create(data);
    return InstructorMapper.toEntity(doc);
  }
  // Find admin by email to support login functionality

  async findByEmail(email: string): Promise<Instructor | null> {
    const doc = await InstructorModel.findOne({ email });
    if (!doc) return null;
    return InstructorMapper.toEntity(doc);
  }

  async findById(id: string): Promise<Instructor | null> {
    const doc = await InstructorModel.findById(id).select(
      'name email bio profilePictureUrl experience socialProfile subject jobTitle averageRating totalReviews',
    );
    if (!doc) return null;
    return InstructorMapper.toEntity(doc);
  }

  async listPaginatedInstructor(
    filter: Record<string, unknown>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1> = { createdAt: -1 },
  ): Promise<{ data: Instructor[]; total: number }> {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(limit, 50);
    const skip = (safePage - 1) * safeLimit;

    const [rawData, total] = await Promise.all([
      InstructorModel.find(filter)
        .select('-passwordHash')
        .sort(sort)
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      InstructorModel.countDocuments(filter), // use countDocuments when a filter exists
    ]);
    const data: Instructor[] = rawData.map((doc) => ({
      ...doc,
      instructorId: (doc._id as Types.ObjectId).toString(),
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt),
    }));

    return { data, total };
  }

  async findByIdAndUpdatePassword(
    id: string,
    passwordHash: string,
  ): Promise<{ name: string; email: string } | void> {
    try {
      const doc = await InstructorModel.findByIdAndUpdate(
        { _id: id },
        { passwordHash },
      );
      if (doc) return { name: doc.name, email: doc.email };
      else return;
    } catch (error) {
      logger.error('Error saving student:', error);
      throw new HttpError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async approve(id: string, adminId: string): Promise<void> {
    await InstructorModel.findByIdAndUpdate(id, {
      accountStatus: 'active',
      approved: true,
      doneBy: adminId,
      doneAt: new Date(),
    });
  }

  async decline(id: string, adminId: string, note: string): Promise<void> {
    await InstructorModel.findByIdAndUpdate(id, {
      accountStatus: 'rejected',
      rejected: true,
      rejectedNote: note,
      doneBy: adminId,
      doneAt: new Date(),
    });
  }

  async findAllApproved(): Promise<Instructor[] | null> {
    const docs = await InstructorModel.find({ approved: true }).select(
      '-passwordHash',
    );
    if (!docs) return null;
    return docs.map((doc) => InstructorMapper.toEntity(doc));
  }

  async changeInstructorStatus(
    id: string,
    status: 'active' | 'suspended',
    note?: string,
  ): Promise<void> {
    await InstructorModel.findByIdAndUpdate(id, {
      accountStatus: status,
      suspendNote: note || null,
    });
  }

  async deleteById(id: string): Promise<void> {
    await InstructorModel.findByIdAndDelete(id);
  }

  async updateById(id: string, updates: Partial<Instructor>): Promise<void> {
    await InstructorModel.findByIdAndUpdate(id, updates);
  }
}
