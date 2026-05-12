import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import {
  IReviewRepository,
  AdminReviewFilters,
  InstructorReviewFilters,
} from '../../domain/IRepositories/IReviewRepository';
import { Review } from '../../domain/entities/Review';
import { ReviewModel, IReviewDoc } from '../models/ReviewModel';
import { ReviewMapper } from '../../application/mappers/ReviewMapper';
import mongoose from 'mongoose';
import { CourseModel } from '../../../course/infrastructure/models/CourseModel';
import { MentorshipBookingModel } from '../../../mentorship/infrastructure/models/MentorshipBookingModel';

export class ReviewRepository
  extends BaseRepository<Review, IReviewDoc>
  implements IReviewRepository
{
  constructor() {
    super(ReviewModel);
  }

  toEntity(doc: IReviewDoc): Review {
    return ReviewMapper.toEntity(doc);
  }

  async findByTarget(
    targetType: string,
    targetId: string,
    sort: 'recent' | 'helpful',
    page: number,
    limit: number,
  ): Promise<Review[]> {
    const skip = (page - 1) * limit;
    const sortObj =
      sort === 'helpful'
        ? { helpfulCount: -1, createdAt: -1 }
        : { createdAt: -1 };

    // Handle potential ObjectId casting for Mixed type field
    const queryTargetId = mongoose.Types.ObjectId.isValid(targetId)
      ? { $in: [targetId, new mongoose.Types.ObjectId(targetId)] }
      : targetId;

    const docs = await this.model
      .find({ targetType, targetId: queryTargetId, isHidden: { $ne: true } })
      .populate('studentId', 'name profilePictureUrl')
      .sort(sortObj as unknown as Record<string, 1 | -1>)
      .skip(skip)
      .limit(limit);

    return docs.map((doc) => this.toEntity(doc));
  }

  async countByTarget(targetType: string, targetId: string): Promise<number> {
    const queryTargetId = mongoose.Types.ObjectId.isValid(targetId)
      ? { $in: [targetId, new mongoose.Types.ObjectId(targetId)] }
      : targetId;

    return this.model.countDocuments({
      targetType,
      targetId: queryTargetId,
      isHidden: { $ne: true },
    });
  }

  async findByStudentAndTarget(
    studentId: string,
    targetType: string,
    targetId: string,
  ): Promise<Review | null> {
    const doc = await this.model.findOne({ studentId, targetType, targetId });
    return doc ? this.toEntity(doc) : null;
  }

  async findInstructorReviews(
    instructorId: string,
    filters: InstructorReviewFilters,
    page: number,
    limit: number,
  ): Promise<Review[]> {
    const skip = (page - 1) * limit;
    const query = this._buildInstructorQuery(instructorId, filters);
    const sort = this._buildInstructorSort(filters);

    const docs = await this.model
      .find(query)
      .populate('studentId', 'name profilePictureUrl')
      .sort(sort as { [key: string]: mongoose.SortOrder })
      .skip(skip)
      .limit(limit);

    await this._populateTargetNames(docs);

    return docs.map((doc) => this.toEntity(doc));
  }

  async countInstructorReviews(
    instructorId: string,
    filters: InstructorReviewFilters,
  ): Promise<number> {
    const query = this._buildInstructorQuery(instructorId, filters);
    return this.model.countDocuments(query);
  }

  private _buildInstructorQuery(
    instructorId: string,
    filters: InstructorReviewFilters,
  ): mongoose.FilterQuery<IReviewDoc> {
    const query: mongoose.FilterQuery<IReviewDoc> = {
      instructorId: new mongoose.Types.ObjectId(instructorId),
      isHidden: { $ne: true },
    };

    if (filters.targetType) {
      query.targetType = filters.targetType;
    }

    if (filters.rating) {
      query.rating = filters.rating;
    }

    if (filters.hasReply !== undefined) {
      if (filters.hasReply) {
        query.instructorReply = { $exists: true, $ne: '' };
      } else {
        query.$or = [
          { instructorReply: { $exists: false } },
          { instructorReply: '' },
        ];
      }
    }

    return query;
  }

  private _buildInstructorSort(
    filters: InstructorReviewFilters,
  ): Record<string, 1 | -1> {
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    return { [sortBy]: sortOrder };
  }

  async findStudentSessionRatings(studentId: string): Promise<
    Record<
      string,
      {
        rating: number;
        comment: string;
        instructorReply?: string;
        repliedAt?: Date;
      }
    >
  > {
    const docs = await this.model
      .find({
        studentId: new mongoose.Types.ObjectId(studentId),
        targetType: 'session',
        isHidden: { $ne: true },
      })
      .select('targetId rating comment instructorReply repliedAt');

    const ratings: Record<
      string,
      {
        rating: number;
        comment: string;
        instructorReply?: string;
        repliedAt?: Date;
      }
    > = {};
    docs.forEach((doc) => {
      ratings[doc.targetId.toString()] = {
        rating: doc.rating,
        comment: doc.comment,
        instructorReply: doc.instructorReply,
        repliedAt: doc.repliedAt,
      };
    });
    return ratings;
  }

  async getAverageRating(
    targetType: string,
    targetId: string,
  ): Promise<{
    average: number;
    count: number;
    distribution: Record<number, number>;
  }> {
    const queryTargetId = mongoose.Types.ObjectId.isValid(targetId)
      ? { $in: [targetId, new mongoose.Types.ObjectId(targetId)] }
      : targetId;

    const result = await this.model.aggregate([
      { $match: { targetType, targetId: queryTargetId, isHidden: { $ne: true } } },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
          count: { $sum: 1 },
          ratingsInfo: { $push: '$rating' },
        },
      },
    ]);

    if (result.length === 0) {
      return {
        average: 0,
        count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const { average, count, ratingsInfo } = result[0];
    const distribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    ratingsInfo.forEach((rating: number) => {
      if (distribution[rating] !== undefined) {
        distribution[rating]++;
      }
    });

    return {
      average: Number(average.toFixed(1)),
      count,
      distribution,
    };
  }

  async getInstructorAverageRating(
    instructorId: string,
  ): Promise<{ average: number; count: number }> {
    const objId = new mongoose.Types.ObjectId(instructorId);
    const result = await this.model.aggregate([
      { $match: { instructorId: objId, isHidden: { $ne: true } } },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      return { average: 0, count: 0 };
    }

    return {
      average: Number(result[0].average.toFixed(1)),
      count: result[0].count,
    };
  }

  async updateReview(reviewId: string, data: Partial<Review>): Promise<void> {
    await this.model.findByIdAndUpdate(reviewId, data);
  }

  async deleteReview(reviewId: string): Promise<void> {
    await this.model.findByIdAndDelete(reviewId);
  }

  async incrementHelpful(reviewId: string, incrementBy: number): Promise<void> {
    await this.model.findByIdAndUpdate(reviewId, {
      $inc: { helpfulCount: incrementBy },
    });
  }

  async hideReview(reviewId: string): Promise<void> {
    await this.model.findByIdAndUpdate(reviewId, { isHidden: true });
  }

  async hasUserUpvoted(reviewId: string, userId: string): Promise<boolean> {
    const doc = await this.model.findOne({
      _id: reviewId,
      upvotedBy: userId,
    });
    return !!doc;
  }

  async addUserUpvote(reviewId: string, userId: string): Promise<void> {
    await this.model.findByIdAndUpdate(reviewId, {
      $addToSet: { upvotedBy: userId },
    });
  }

  async removeUserUpvote(reviewId: string, userId: string): Promise<void> {
    await this.model.findByIdAndUpdate(reviewId, {
      $pull: { upvotedBy: userId },
    });
  }

  async findAllForAdmin(
    filters: AdminReviewFilters,
    page: number,
    limit: number,
  ): Promise<Review[]> {
    const query = this._buildAdminQuery(filters);
    const skip = (page - 1) * limit;
    const sortField = filters.sortBy ?? 'createdAt';
    const sortDir = filters.sortOrder === 'asc' ? 1 : -1;

    const docs = await this.model
      .find(query)
      .populate('studentId', 'name profilePictureUrl')
      .sort({ [sortField]: sortDir } as Record<string, 1 | -1>)
      .skip(skip)
      .limit(limit);

    await this._populateTargetNames(docs);

    return docs.map((doc) => this.toEntity(doc));
  }

  async countAllForAdmin(filters: AdminReviewFilters): Promise<number> {
    return this.model.countDocuments(this._buildAdminQuery(filters));
  }

  async unhideReview(reviewId: string): Promise<void> {
    await this.model.findByIdAndUpdate(reviewId, { isHidden: false });
  }

  async adminDeleteReview(reviewId: string): Promise<void> {
    await this.model.findByIdAndDelete(reviewId);
  }

  private _buildAdminQuery(
    filters: AdminReviewFilters,
  ): Record<string, unknown> {
    const query: Record<string, unknown> = {};
    if (filters.targetType) query.targetType = filters.targetType;
    if (typeof filters.isHidden === 'boolean') {
      query.isHidden = filters.isHidden ? true : { $ne: true };
    }
    if (filters.minRating !== undefined || filters.maxRating !== undefined) {
      query.rating = {};
      if (filters.minRating !== undefined)
        (query.rating as Record<string, number>)['$gte'] = filters.minRating;
      if (filters.maxRating !== undefined)
        (query.rating as Record<string, number>)['$lte'] = filters.maxRating;
    }
    if (filters.search?.trim()) {
      query.comment = { $regex: filters.search.trim(), $options: 'i' };
    }
    return query;
  }

  private async _populateTargetNames(
    docs: IReviewDoc[],
  ): Promise<IReviewDoc[]> {
    if (docs.length === 0) return docs;

    const courseIds = docs
      .filter((d) => d.targetType === 'course')
      .map((d) => d.targetId);
    const bookingIds = docs
      .filter((d) => d.targetType === 'session')
      .map((d) => d.targetId);

    const [courses, bookings] = await Promise.all([
      courseIds.length > 0
        ? CourseModel.find({ _id: { $in: courseIds } }).select('title')
        : Promise.resolve([]),
      bookingIds.length > 0
        ? MentorshipBookingModel.find({ _id: { $in: bookingIds } }).select(
            'scheduledAt',
          )
        : Promise.resolve([]),
    ]);

    const courseMap = new Map<string, string>(
      (courses as Array<{ _id: mongoose.Types.ObjectId; title: string }>).map(
        (c) => [c._id.toString(), c.title],
      ),
    );
    const bookingMap = new Map<string, string>(
      (
        bookings as Array<{ _id: mongoose.Types.ObjectId; scheduledAt: Date }>
      ).map((b) => [
        b._id.toString(),
        `Session on ${b.scheduledAt.toLocaleDateString()}`,
      ]),
    );

    docs.forEach((doc) => {
      const targetIdStr = doc.targetId.toString();
      if (doc.targetType === 'course') {
        (doc as IReviewDoc & { targetName?: string }).targetName =
          courseMap.get(targetIdStr);
      } else if (doc.targetType === 'session') {
        (doc as IReviewDoc & { targetName?: string }).targetName =
          bookingMap.get(targetIdStr);
      }
    });

    return docs;
  }
}
