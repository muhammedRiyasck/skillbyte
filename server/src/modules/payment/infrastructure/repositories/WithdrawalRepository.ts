import { Model } from 'mongoose';
import { IWithdrawalRepository } from '../../domain/IRepositories/IWithdrawalRepository';
import { IWithdrawal } from '../../domain/entities/Withdrawal';
import { WithdrawalMapper } from '../mappers/WithdrawalMapper';
import {
  IWithdrawalDocument,
  WithdrawalModel,
} from '../models/WithdrawalModel';
import { WithdrawalStatus } from '../../domain/entities/Withdrawal';

export class WithdrawalRepository implements IWithdrawalRepository {
  private model: Model<IWithdrawalDocument>;

  constructor() {
    this.model = WithdrawalModel;
  }

  async save(withdrawal: Partial<IWithdrawal>): Promise<IWithdrawal> {
    const newWithdrawal = new this.model(withdrawal);
    const saved = await newWithdrawal.save();
    return WithdrawalMapper.toEntity(saved);
  }

  async findById(id: string): Promise<IWithdrawal | null> {
    const doc = await this.model.findById(id);
    return doc ? WithdrawalMapper.toEntity(doc) : null;
  }

  async findByTransactionId(
    transactionId: string,
  ): Promise<IWithdrawal | null> {
    const doc = await this.model.findOne({ transactionId });
    return doc ? WithdrawalMapper.toEntity(doc) : null;
  }

  async findByInstructorId(
    instructorId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: IWithdrawal[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.model
        .find({ instructorId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.model.countDocuments({ instructorId }),
    ]);
    return { data: data.map(WithdrawalMapper.toEntity), total };
  }

  async updateStatus(
    id: string,
    status: WithdrawalStatus,
    transactionId?: string,
    adminNotes?: string,
  ): Promise<void> {
    const updates: Record<string, string | number | boolean | Date> = {
      status,
    };
    if (transactionId) updates.transactionId = transactionId;
    if (adminNotes) updates.adminNotes = adminNotes;
    await this.model.findByIdAndUpdate(id, updates);
  }

  async updateStatusWithCondition(
    id: string,
    newStatus: WithdrawalStatus,
    currentStatus: WithdrawalStatus,
    transactionId?: string,
    adminNotes?: string,
  ): Promise<IWithdrawal | null> {
    const updates: Record<string, string | number | boolean | Date> = {
      status: newStatus,
    };
    if (transactionId) updates.transactionId = transactionId;
    if (adminNotes) updates.adminNotes = adminNotes;

    const doc = await this.model.findOneAndUpdate(
      { _id: id, status: currentStatus },
      updates,
      { new: true },
    );
    return doc ? WithdrawalMapper.toEntity(doc) : null;
  }

  async findAll(
    filter: Record<string, unknown> = {},
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ data: IWithdrawal[]; total: number }> {
    const skip = (page - 1) * limit;
    const queryFilter = { ...filter };

    if (search) {
      // For search, we need to find instructor IDs that match the search term
      // and then filter the withdrawals by those IDs.
      // Alternatively, we can use an aggregation, but it's more complex.
      // Let's use a simpler approach for now:
      // 1. We assume Instructor model is registered.
      const InstructorModel = this.model.db.model('Instructor');
      const matchedInstructors = await InstructorModel.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      const instructorIds = matchedInstructors.map((i) => i._id);
      queryFilter.instructorId = { $in: instructorIds };
    }

    const [data, total] = await Promise.all([
      this.model
        .find(queryFilter)
        .populate('instructorId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.model.countDocuments(queryFilter),
    ]);
    return { data: data.map(WithdrawalMapper.toEntity), total };
  }

  async hasPendingWithdrawal(instructorId: string): Promise<boolean> {
    const existing = await this.model
      .findOne({
        instructorId,
        status: {
          $in: [WithdrawalStatus.PENDING, WithdrawalStatus.PROCESSING],
        },
      })
      .lean();
    return !!existing;
  }
}
