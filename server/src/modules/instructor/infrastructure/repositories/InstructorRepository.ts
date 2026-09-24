import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { InstructorModel, IInstructor } from '../models/InstructorModel';
import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { Instructor } from '../../domain/entities/Instructor';
import { InstructorMapper } from '../mappers/InstructorMapper';
import { HttpError } from '../../../../shared/types/HttpError';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import logger from '../../../../shared/utils/Logger';

/** Manages database operations for instructor. */
export class InstructorRepository
  extends BaseRepository<Instructor, IInstructor>
  implements IInstructorRepository
{
  constructor() {
    super(InstructorModel);
  }

  /**
   * To entity for the Instructor entity.
   *
   * @param doc - The doc information.
   * @returns The result of the operation.
   */
  toEntity(doc: IInstructor): Instructor {
    return InstructorMapper.toEntity(doc);
  }

  /**
   * Find by email for the Instructor entity.
   *
   * @param email - The email information.
   * @returns The result of the operation.
   */
  async findByEmail(email: string): Promise<Instructor | null> {
    const doc = await this.model.findOne({ email });
    if (!doc) return null;
    return this.toEntity(doc);
  }

  /**
   * Find by stripe account id for the Instructor entity.
   *
   * @param stripeAccountId - The unique identifier for the stripeAccount.
   * @returns The result of the operation.
   */
  async findByStripeAccountId(
    stripeAccountId: string,
  ): Promise<Instructor | null> {
    const doc = await this.model.findOne({ stripeAccountId });
    if (!doc) return null;
    return this.toEntity(doc);
  }

  // Override to restrict fields as in original implementation
  /**
   * Find by id for the Instructor entity.
   *
   * @param id - The unique identifier for the id.
   * @returns The result of the operation.
   */
  async findById(id: string): Promise<Instructor | null> {
    const doc = await this.model
      .findById(id)
      .select(
        'name email bio profilePictureUrl resumeUrl experience socialProfile subject jobTitle averageRating totalReviews totalEarnings withdrawnAmount stripeAccountId isStripeVerified',
      );
    if (!doc) return null;
    return this.toEntity(doc);
  }

  /**
   * Find by ids for the Instructor entity.
   *
   * @param ids - The unique identifier for the ids.
   * @returns The result of the operation.
   */
  async findByIds(ids: string[]): Promise<Instructor[]> {
    if (!ids.length) return [];

    const docs = await this.model
      .find({ _id: { $in: ids } })
      .select(
        'name email bio profilePictureUrl experience socialProfile subject jobTitle averageRating totalReviews totalEarnings withdrawnAmount stripeAccountId isStripeVerified',
      );

    return docs.map((doc) => this.toEntity(doc));
  }

  // Override to exclude passwordHash as in original implementation
  /**
   * Paginated list for the Instructor entity.
   *
   * @param filter - The filter information.
   * @param page - The page information.
   * @param limit - The limit information.
   * @param sort - The sort information.
   * @returns The result of the operation.
   */
  async paginatedList(
    filter: Record<string, unknown>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1> = { createdAt: -1 },
  ): Promise<{ data: Instructor[]; total: number }> {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(limit, 50);
    const skip = (safePage - 1) * safeLimit;

    const [rawData, total] = await Promise.all([
      this.model
        .find(filter)
        .select('-passwordHash')
        .sort(sort)
        .skip(skip)
        .limit(safeLimit),
      this.model.countDocuments(filter),
    ]);

    const data: Instructor[] = rawData.map((doc: IInstructor) =>
      this.toEntity(doc),
    );

    return { data, total };
  }

  /**
   * Find by id and update password for the Instructor entity.
   *
   * @param id - The unique identifier for the id.
   * @param passwordHash - The password hash information.
   * @returns The result of the operation.
   */
  async findByIdAndUpdatePassword(
    id: string,
    passwordHash: string,
  ): Promise<{ name: string; email: string } | void> {
    try {
      const doc = await this.model.findByIdAndUpdate(id, { passwordHash });
      if (doc) {
        return { name: doc.name, email: doc.email };
      } else return;
    } catch (error) {
      logger.error('Error saving student:', error);
      throw new HttpError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Approve for the Instructor entity.
   *
   * @param id - The unique identifier for the id.
   * @param adminId - The unique identifier for the admin.
   */
  async approve(id: string, adminId: string): Promise<void> {
    await this.model.findByIdAndUpdate(id, {
      accountStatus: 'active',
      approved: true,
      doneBy: adminId,
      doneAt: new Date(),
    });
  }

  /**
   * Decline for the Instructor entity.
   *
   * @param id - The unique identifier for the id.
   * @param adminId - The unique identifier for the admin.
   * @param note - The note information.
   */
  async decline(id: string, adminId: string, note: string): Promise<void> {
    await this.model.findByIdAndUpdate(id, {
      accountStatus: 'rejected',
      rejected: true,
      rejectedNote: note,
      doneBy: adminId,
      doneAt: new Date(),
    });
  }

  /**
   * Change instructor status for the Instructor entity.
   *
   * @param id - The unique identifier for the id.
   * @param status - The status information.
   * @param note - The note information.
   */
  async changeInstructorStatus(
    id: string,
    status: 'active' | 'suspended',
    note?: string,
  ): Promise<void> {
    await this.model.findByIdAndUpdate(id, {
      accountStatus: status,
      suspendNote: note || null,
    });
  }

  /**
   * Update by id for the Instructor entity.
   *
   * @param id - The unique identifier for the id.
   * @param updates - The updates information.
   */
  async updateById(id: string, updates: Partial<Instructor>): Promise<void> {
    await this.model.findByIdAndUpdate(id, updates);
  }

  /**
   * Decrement withdrawn amount for the Instructor entity.
   *
   * @param id - The unique identifier for the id.
   * @param amount - The amount information.
   */
  async decrementWithdrawnAmount(id: string, amount: number): Promise<void> {
    await this.model.findByIdAndUpdate(id, {
      $inc: { withdrawnAmount: -amount },
    });
  }

  /**
   * Increment total earnings for the Instructor entity.
   *
   * @param id - The unique identifier for the id.
   * @param amount - The amount information.
   */
  async incrementTotalEarnings(id: string, amount: number): Promise<void> {
    await this.model.findByIdAndUpdate(id, {
      $inc: { totalEarnings: amount },
    });
  }

  /**
   * Increment withdrawn amount for the Instructor entity.
   *
   * @param id - The unique identifier for the id.
   * @param amount - The amount information.
   */
  async incrementWithdrawnAmount(id: string, amount: number): Promise<void> {
    await this.model.findByIdAndUpdate(id, {
      $inc: { withdrawnAmount: amount },
    });
  }

  /**
   * Update stripe verification status for the Instructor entity.
   *
   * @param id - The unique identifier for the id.
   * @param isVerified - The is verified information.
   */
  async updateStripeVerificationStatus(
    id: string,
    isVerified: boolean,
  ): Promise<void> {
    await this.model.findByIdAndUpdate(id, { isStripeVerified: isVerified });
  }

  /**
   * Get top earning instructors for the Instructor entity.
   *
   * @param limit - The limit information.
   * @returns The result of the operation.
   */
  async getTopEarningInstructors(limit: number): Promise<Instructor[]> {
    const rawData = await this.model
      .find({ approved: true })
      .sort({ totalEarnings: -1 })
      .limit(limit)
      .select('name profilePictureUrl totalEarnings averageRating totalReviews')
      .lean();
    return rawData.map((doc) => this.toEntity(doc as unknown as IInstructor));
  }
}
