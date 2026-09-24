import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IQuizAttemptRepository } from '../../domain/IRepositories/IQuizAttemptRepository';
import { IQuizAttempt } from '../../domain/entities/QuizAttempt';
import { QuizAttemptModel, IQuizAttemptDoc } from '../models/QuizAttemptModel';
import { Model } from 'mongoose';

/** Manages database operations for quiz attempt. */
export class QuizAttemptRepository
  extends BaseRepository<IQuizAttempt, IQuizAttemptDoc>
  implements IQuizAttemptRepository
{
  constructor() {
    super(QuizAttemptModel as Model<IQuizAttemptDoc>);
  }

  /**
   * To entity for the QuizAttempt entity.
   *
   * @param doc - The doc information.
   * @returns The result of the operation.
   */
  toEntity(doc: IQuizAttemptDoc): IQuizAttempt {
    return this.mapToEntity(doc as unknown as Record<string, unknown>);
  }

  /**
   * Create for the QuizAttempt entity.
   *
   * @param attempt - The attempt information.
   * @returns The result of the operation.
   */
  async create(attempt: IQuizAttempt): Promise<IQuizAttempt> {
    const createdAttempt = await super.save(attempt);
    return createdAttempt;
  }

  /**
   * Update for the QuizAttempt entity.
   *
   * @param attemptId - The unique identifier for the attempt.
   * @param updates - The updates information.
   * @returns The result of the operation.
   */
  async update(
    attemptId: string,
    updates: Partial<IQuizAttempt>,
  ): Promise<IQuizAttempt | null> {
    const updatedAttempt = await this.model
      .findByIdAndUpdate(attemptId, { $set: updates }, { new: true })
      .lean();
    return updatedAttempt
      ? this.mapToEntity(updatedAttempt as unknown as Record<string, unknown>)
      : null;
  }

  /**
   * Find by id for the QuizAttempt entity.
   *
   * @param attemptId - The unique identifier for the attempt.
   * @returns The result of the operation.
   */
  async findById(attemptId: string): Promise<IQuizAttempt | null> {
    return super.findById(attemptId);
  }

  /**
   * Find latest by course and user for the QuizAttempt entity.
   *
   * @param courseId - The unique identifier for the course.
   * @param userId - The unique identifier for the user.
   * @returns The result of the operation.
   */
  async findLatestByCourseAndUser(
    courseId: string,
    userId: string,
  ): Promise<IQuizAttempt | null> {
    const attempt = await this.model
      .findOne({ courseId, userId })
      .sort({ attemptNumber: -1 })
      .lean();
    return attempt
      ? this.mapToEntity(attempt as unknown as Record<string, unknown>)
      : null;
  }

  /**
   * Count attempts by user for the QuizAttempt entity.
   *
   * @param courseId - The unique identifier for the course.
   * @param userId - The unique identifier for the user.
   * @returns The result of the operation.
   */
  async countAttemptsByUser(courseId: string, userId: string): Promise<number> {
    return this.model.countDocuments({ courseId, userId });
  }

  /**
   * Find all by course id for the QuizAttempt entity.
   *
   * @param courseId - The unique identifier for the course.
   * @returns The result of the operation.
   */
  async findAllByCourseId(courseId: string): Promise<IQuizAttempt[]> {
    const attempts = await this.model.find({ courseId }).lean();
    return attempts.map((attempt) =>
      this.mapToEntity(attempt as unknown as Record<string, unknown>),
    );
  }

  /**
   * Delete attempts by course and user for the QuizAttempt entity.
   *
   * @param courseId - The unique identifier for the course.
   * @param userId - The unique identifier for the user.
   */
  async deleteAttemptsByCourseAndUser(
    courseId: string,
    userId: string,
  ): Promise<void> {
    await this.model.deleteMany({ courseId, userId });
  }

  /**
   * Find all by course and user for the QuizAttempt entity.
   *
   * @param courseId - The unique identifier for the course.
   * @param userId - The unique identifier for the user.
   * @returns The result of the operation.
   */
  async findAllByCourseAndUser(
    courseId: string,
    userId: string,
  ): Promise<IQuizAttempt[]> {
    const attempts = await this.model
      .find({ courseId, userId })
      .sort({ attemptNumber: 1 })
      .lean();
    return attempts.map((attempt) =>
      this.mapToEntity(attempt as unknown as Record<string, unknown>),
    );
  }

  /**
   * Find attempts with student details for the QuizAttempt entity.
   *
   * @param courseId - The unique identifier for the course.
   * @returns The result of the operation.
   */
  async findAttemptsWithStudentDetails(courseId: string): Promise<unknown[]> {
    const attempts = await this.model
      .find({ courseId })
      .populate('userId', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .lean();
    return attempts as unknown[];
  }

  private mapToEntity(doc: Record<string, unknown>): IQuizAttempt {
    // If it's a Mongoose document, convert to plain object first
    const hasToObject = (
      d: unknown,
    ): d is { toObject: () => Record<string, unknown> } =>
      !!d && typeof (d as { toObject?: unknown }).toObject === 'function';

    const raw = hasToObject(doc) ? doc.toObject() : doc;
    const cleanRaw = raw as Record<string, unknown> & {
      _id?: unknown;
      courseId?: unknown;
      userId?: unknown;
      configId?: unknown;
    };

    return {
      attemptId: cleanRaw._id?.toString(),
      ...cleanRaw,
      // Ensure courseId and userId are mapped as strings instead of ObjectIds
      courseId: cleanRaw.courseId?.toString(),
      userId: cleanRaw.userId?.toString(),
      configId: cleanRaw.configId?.toString(),
    } as unknown as IQuizAttempt;
  }
}
