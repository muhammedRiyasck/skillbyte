export interface IReport {
  _id: string;
  reportedBy: string;
  studentInfo?: {
    name?: string;
    profilePictureUrl?: string;
  };
  targetType: 'review' | 'course' | 'lesson';
  targetId: string;
  reason: string;
  description?: string;
  status: 'pending' | 'dismissed' | 'actioned';
  createdAt: string;
  updatedAt: string;
  targetDetails?: {
    title?: string;
    comment?: string;
    rating?: number;
  };
}

export interface ReportResponse {
  reports: IReport[];
  total: number;
}
