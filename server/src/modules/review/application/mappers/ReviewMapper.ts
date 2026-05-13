import { Review } from '../../domain/entities/Review';

export class ReviewMapper {
  static toResponseDto(
    review: Review,
    studentInfo?: { name: string; profileImageUrl?: string },
    isUpvotedByCurrentUser: boolean = false,
  ) {
    return {
      reviewId: review.reviewId!, // Asserts presence since it's coming from DB
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
}
