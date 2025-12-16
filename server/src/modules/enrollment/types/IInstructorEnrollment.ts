export interface IInstructorEnrollment {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  courseId: {
    _id: string;
    title: string;
    thumbnailUrl?: string;
    price: number;
  };
  status: string;
  enrolledAt: Date;
  progress: number;
}

export interface ICourseEnrollmentSummary {
  courseId: string;
  courseTitle: string;
  courseThumbnail?: string;
  coursePrice: number;
  enrollments: {
    studentId: string;
    studentName: string;
    studentEmail: string;
    enrollmentDate: Date;
    status: string;
    progress: number;
  }[];
}
