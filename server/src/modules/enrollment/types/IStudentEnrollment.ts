export interface IStudentEnrollment {
  id: string;
  title: string;
  instructorId: string;
  thumbnailUrl: string;
  subText: string;
  category: string;
  courseLevel: string;
  language: string;
  price: number;
  averageRating: number;
  totalReviews: number;
  enrolledAt: Date;
  progress: number;
  enrollmentStatus: string;
  isEnrolled: boolean;
}
