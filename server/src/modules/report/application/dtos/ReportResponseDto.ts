export interface ReportResponseDto {
  _id: string; // Map for frontend compatibility
  studentId: string;
  studentInfo?: {
    name?: string;
    profilePictureUrl?: string;
  };
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
