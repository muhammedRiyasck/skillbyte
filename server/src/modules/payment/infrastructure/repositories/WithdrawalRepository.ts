import { Model } from 'mongoose';
import { IWithdrawalRepository } from '../../domain/IRepositories/IWithdrawalRepository';
import {
  IWithdrawalDocument,
  WithdrawalModel,
  WithdrawalStatus,
} from '../models/WithdrawalModel';

export class WithdrawalRepository implements IWithdrawalRepository {
  private model: Model<IWithdrawalDocument>;

  constructor() {
    this.model = WithdrawalModel;
  }

  async save(withdrawal: IWithdrawalDocument): Promise<IWithdrawalDocument> {
    const newWithdrawal = new this.model(withdrawal);
    return await newWithdrawal.save();
  }

  async findById(id: string): Promise<IWithdrawalDocument | null> {
    return await this.model.findById(id);
  }

  async findByTransactionId(
    transactionId: string,
  ): Promise<IWithdrawalDocument | null> {
    return await this.model.findOne({ transactionId });
  }

  async findByInstructorId(
    instructorId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: IWithdrawalDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.model
        .find({ instructorId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.model.countDocuments({ instructorId }),
    ]);
    return { data, total };
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
  ): Promise<IWithdrawalDocument | null> {
    const updates: Record<string, string | number | boolean | Date> = {
      status: newStatus,
    };
    if (transactionId) updates.transactionId = transactionId;
    if (adminNotes) updates.adminNotes = adminNotes;

    return await this.model.findOneAndUpdate(
      { _id: id, status: currentStatus },
      updates,
      { new: true },
    );
  }

  async findAll(
    filter: Record<string, unknown> = {},
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ data: IWithdrawalDocument[]; total: number }> {
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
    return { data, total };
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
