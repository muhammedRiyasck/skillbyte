import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IQuizAttemptRepository } from '../../domain/IRepositories/IQuizAttemptRepository';
import { IQuizAttempt } from '../../domain/entities/QuizAttempt';
import { QuizAttemptModel, IQuizAttemptDoc } from '../models/QuizAttemptModel';
import { Model } from 'mongoose';

export class QuizAttemptRepository
  extends BaseRepository<IQuizAttempt, IQuizAttemptDoc>
  implements IQuizAttemptRepository
{
  constructor() {
    super(QuizAttemptModel as Model<IQuizAttemptDoc>);
  }

  toEntity(doc: IQuizAttemptDoc): IQuizAttempt {
    return this.mapToEntity(doc as unknown as Record<string, unknown>);
  }

  async create(attempt: IQuizAttempt): Promise<IQuizAttempt> {
    const createdAttempt = await super.save(attempt);
    return createdAttempt;
  }

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

  async findById(attemptId: string): Promise<IQuizAttempt | null> {
    return super.findById(attemptId);
  }

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

  async countAttemptsByUser(courseId: string, userId: string): Promise<number> {
    return this.model.countDocuments({ courseId, userId });
  }

  async findAllByCourseId(courseId: string): Promise<IQuizAttempt[]> {
    const attempts = await this.model.find({ courseId }).lean();
    return attempts.map((attempt) =>
      this.mapToEntity(attempt as unknown as Record<string, unknown>),
    );
  }

  async deleteAttemptsByCourseAndUser(
    courseId: string,
    userId: string,
  ): Promise<void> {
    await this.model.deleteMany({ courseId, userId });
  }

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
