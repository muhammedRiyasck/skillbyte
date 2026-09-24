import { Model } from 'mongoose';
import { IWithdrawalRepository } from '../../domain/IRepositories/IWithdrawalRepository';
import { IWithdrawal } from '../../domain/entities/Withdrawal';
import { WithdrawalMapper } from '../mappers/WithdrawalMapper';
import {
  IWithdrawalDocument,
  WithdrawalModel,
} from '../models/WithdrawalModel';
import { WithdrawalStatus } from '../../domain/entities/Withdrawal';

/** Manages database operations for withdrawal. */
export class WithdrawalRepository implements IWithdrawalRepository {
  private model: Model<IWithdrawalDocument>;

  constructor() {
    this.model = WithdrawalModel;
  }

  /**
   * Save for the Withdrawal entity.
   *
   * @param withdrawal - The withdrawal information.
   * @returns The result of the operation.
   */
  async save(withdrawal: Partial<IWithdrawal>): Promise<IWithdrawal> {
    const newWithdrawal = new this.model(withdrawal);
    const saved = await newWithdrawal.save();
    return WithdrawalMapper.toEntity(saved);
  }

  /**
   * Find by id for the Withdrawal entity.
   *
   * @param id - The unique identifier for the id.
   * @returns The result of the operation.
   */
  async findById(id: string): Promise<IWithdrawal | null> {
    const doc = await this.model.findById(id);
    return doc ? WithdrawalMapper.toEntity(doc) : null;
  }

  /**
   * Find by transaction id for the Withdrawal entity.
   *
   * @param transactionId - The unique identifier for the transaction.
   * @returns The result of the operation.
   */
  async findByTransactionId(
    transactionId: string,
  ): Promise<IWithdrawal | null> {
    const doc = await this.model.findOne({ transactionId });
    return doc ? WithdrawalMapper.toEntity(doc) : null;
  }

  /**
   * Find by instructor id for the Withdrawal entity.
   *
   * @param instructorId - The unique identifier for the instructor.
   * @param page - The page information.
   * @param limit - The limit information.
   * @returns The result of the operation.
   */
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

  /**
   * Update status for the Withdrawal entity.
   *
   * @param id - The unique identifier for the id.
   * @param status - The status information.
   * @param transactionId - The unique identifier for the transaction.
   * @param adminNotes - The admin notes information.
   */
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

  /**
   * Update status with condition for the Withdrawal entity.
   *
   * @param id - The unique identifier for the id.
   * @param newStatus - The new status information.
   * @param currentStatus - The current status information.
   * @param transactionId - The unique identifier for the transaction.
   * @param adminNotes - The admin notes information.
   * @returns The result of the operation.
   */
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

  /**
   * Find all for the Withdrawal entity.
   *
   * @param filter - The filter information.
   * @param page - The page information.
   * @param limit - The limit information.
   * @param search - The search information.
   * @returns The result of the operation.
   */
  async findAll(
    filter: Record<string, unknown> = {},
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ data: IWithdrawal[]; total: number }> {
    const skip = (page - 1) * limit;
    const queryFilter = { ...filter };

    if (search) {
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

  /**
   * Has pending withdrawal for the Withdrawal entity.
   *
   * @param instructorId - The unique identifier for the instructor.
   * @returns The result of the operation.
   */
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
