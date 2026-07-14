export interface InstructorEnrollmentItemDto {
  studentId: string;
  studentName: string;
  studentEmail: string;
  enrollmentDate: Date;
  status: string;
  progress: number;
}

export interface CourseEnrollmentSummaryDto {
  id: string;
  courseTitle: string;
  courseThumbnail?: string;
  coursePrice: number;
  enrollments: InstructorEnrollmentItemDto[];
}

export interface InstructorEnrollmentsResponseDto {
  data: CourseEnrollmentSummaryDto[];
  totalCount: number;
  totalStudents: number;
}
