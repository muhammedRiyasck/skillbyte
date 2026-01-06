export interface ILessonProgress {
  lessonId: string;
  lastWatchedSecond: number;
  totalDuration: number;
  isCompleted: boolean;
  lastUpdated?: Date;
}

export interface IEnrollment {
  enrollmentId?: string;
  userId: string;
  courseId: string;
  paymentId?: string;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'refunded';
  enrolledAt: Date;
  completedAt?: Date;
  progress: number;
  lessonProgress: ILessonProgress[];
  createdAt?: Date;
  updatedAt?: Date;
}
