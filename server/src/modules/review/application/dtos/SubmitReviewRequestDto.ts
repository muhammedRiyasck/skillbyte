export interface SubmitReviewRequestDto {
  targetType: 'course' | 'session';
  targetId: string;
  rating: number;
  comment: string;
}
