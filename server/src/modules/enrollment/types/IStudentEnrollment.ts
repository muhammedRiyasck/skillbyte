export interface IStudentEnrollment {
  courseId: string;
  title: string;
  instructorId: string;
  thumbnailUrl: string;
  subText: string;
  category: string;
  courseLevel: string;
  language: string;
  price: number;
  rating: number;
  reviews: number;
  enrolledAt: Date;
  progress: number;
  enrollmentStatus: string;
  isEnrolled: boolean;
}
