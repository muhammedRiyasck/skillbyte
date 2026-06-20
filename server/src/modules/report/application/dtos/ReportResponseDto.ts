export interface ReportResponseDto {
  id: string;
  studentId: string;
  targetType: 'review' | 'course' | 'lesson';
  targetId: string;
  targetDetails?: {
    title?: string;
    comment?: string;
    rating?: number;
  };
  reason: string;
  description?: string;
  status: 'pending' | 'dismissed' | 'actioned';
  createdAt: Date;
  updatedAt: Date;
}
