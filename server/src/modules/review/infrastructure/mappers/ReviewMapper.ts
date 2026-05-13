import mongoose from 'mongoose';
import { Review } from '../../domain/entities/Review';
import { IReviewDoc } from '../models/ReviewModel';

interface PopulatedStudent {
  _id: mongoose.Types.ObjectId;
  name: string;
  profilePictureUrl?: string;
}

export class ReviewMapper {
  static toEntity(doc: IReviewDoc): Review {
    // studentId might be populated (an object), unpopulated (an ObjectId), or null (if student deleted)
    const isPopulated =
      doc.studentId &&
      typeof doc.studentId === 'object' &&
      '_id' in doc.studentId;

    const studentId = doc.studentId
      ? isPopulated
        ? (doc.studentId as unknown as PopulatedStudent)._id.toString()
        : doc.studentId.toString()
      : 'deleted-user';

    const studentInfo = isPopulated
      ? {
          name: (doc.studentId as unknown as PopulatedStudent).name,
          profileImageUrl: (doc.studentId as unknown as PopulatedStudent)
            .profilePictureUrl,
        }
      : undefined;

    return new Review(
      studentId,
      doc.targetType,
      doc.targetId.toString(),
      doc.instructorId.toString(),
      doc.rating,
      doc.comment,
      doc.helpfulCount,
      doc.isHidden,
      doc._id?.toString(),
      doc.createdAt,
      doc.updatedAt,
      studentInfo,
      doc.instructorReply,
      doc.repliedAt,
      (doc as IReviewDoc & { targetName?: string }).targetName,
    );
  }
}
