import { EnrollmentStatus } from '../../../../shared/enums/EnrollmentStatus';

export interface LessonProgressDto {
  lessonId: string;
  lastWatchedSecond: number;
  totalDuration: number;
  isCompleted: boolean;
  lastUpdated?: Date;
}

export interface EnrollmentResponseDto {
  enrollmentId: string;
  userId: string;
  courseId: string;
  paymentId?: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  completedAt?: Date;
  progress: number;
  lessonProgress: LessonProgressDto[];
}
