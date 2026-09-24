import { Review } from '../../domain/entities/Review';
import { ReviewResponseDto } from '../dtos/ReviewResponseDto';

/** Handles review mapper functionality. */
export class ReviewMapper {
  /**
   * To dto for the ReviewMapper entity.
   *
   * @param review - The review information.
   * @param studentInfo - The student info information.
   * @param isUpvotedByCurrentUser - The is upvoted by current user information.
   * @returns The standardized HTTP response.
   */
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
  /**
   * To response dto for the ReviewMapper entity.
   *
   * @param review - The review information.
   * @param studentInfo - The student info information.
   * @param isUpvotedByCurrentUser - The is upvoted by current user information.
   * @returns The standardized HTTP response.
   */
  static toResponseDto(
    review: Review,
    studentInfo?: { name: string; profileImageUrl?: string },
    isUpvotedByCurrentUser: boolean = false,
  ): ReviewResponseDto {
    return ReviewMapper.toDto(review, studentInfo, isUpvotedByCurrentUser);
  }
}
