export interface IInstructorEnrollment {
  data: {
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
  }[];
  totalCount: { count: number }[];
}

export interface IEnrollmentFilters {
  search?: string;
  courseId?: string;
  status?: string;
  sort?: 'newest' | 'oldest';
}

export interface ICourseEnrollmentSummary {
  data: {
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
  }[];
  totalCount: number;
}
