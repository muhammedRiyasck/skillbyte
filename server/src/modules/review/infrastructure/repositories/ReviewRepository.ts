import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IReviewRepository } from '../../domain/IRepositories/IReviewRepository';
import { Review } from '../../domain/entities/Review';
import { ReviewModel, IReviewDoc } from '../models/ReviewModel';
import { ReviewMapper } from '../../application/mappers/ReviewMapper';
import mongoose from 'mongoose';

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

    const docs = await this.model
      .find({ targetType, targetId })
      .populate('studentId', 'name profilePictureUrl')
      .sort(sortObj as unknown as Record<string, 1 | -1>)
      .skip(skip)
      .limit(limit);

    return docs.map((doc) => this.toEntity(doc));
  }

  async countByTarget(targetType: string, targetId: string): Promise<number> {
    return this.model.countDocuments({ targetType, targetId });
  }

  async findByStudentAndTarget(
    studentId: string,
    targetType: string,
    targetId: string,
  ): Promise<Review | null> {
    const doc = await this.model.findOne({ studentId, targetType, targetId });
    return doc ? this.toEntity(doc) : null;
  }

  async findStudentSessionRatings(
    studentId: string,
  ): Promise<Record<string, number>> {
    const docs = await this.model
      .find({
        studentId: new mongoose.Types.ObjectId(studentId),
        targetType: 'session',
      })
      .select('targetId rating');

    const ratings: Record<string, number> = {};
    docs.forEach((doc) => {
      ratings[doc.targetId.toString()] = doc.rating;
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
    const result = await this.model.aggregate([
      { $match: { targetType, targetId: targetId } },
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
      { $match: { instructorId: objId } },
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

  async reportReview(reviewId: string): Promise<void> {
    await this.model.findByIdAndUpdate(reviewId, { isReported: true });
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
}
