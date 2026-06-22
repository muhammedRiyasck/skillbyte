import { Review } from '../../domain/entities/Review';
import { ReviewResponseDto } from '../dtos/ReviewResponseDto';

export class ReviewMapper {
  static toDto(
    review: Review,
    studentInfo?: { name: string; profileImageUrl?: string },
    isUpvotedByCurrentUser: boolean = false,
  ): ReviewResponseDto {
    return {
      reviewId: review.reviewId!,
      studentId: review.studentId,
      student: studentInfo,
      targetType: review.targetType,
      targetId: review.targetId,
      instructorId: review.instructorId,
      rating: review.rating,
      comment: review.comment,
      helpfulCount: review.helpfulCount,
      isUpvotedByCurrentUser,
      instructorReply: review.instructorReply,
      repliedAt: review.repliedAt,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      targetName: review.targetName,
    };
  }

  // Backward-compat alias
  static toResponseDto(
    review: Review,
    studentInfo?: { name: string; profileImageUrl?: string },
    isUpvotedByCurrentUser: boolean = false,
  ): ReviewResponseDto {
    return ReviewMapper.toDto(review, studentInfo, isUpvotedByCurrentUser);
  }
}
