export interface SubmitReportRequestDto {
  targetType: 'review' | 'course' | 'lesson';
  targetId: string;
  reason: string;
  description?: string;
}
