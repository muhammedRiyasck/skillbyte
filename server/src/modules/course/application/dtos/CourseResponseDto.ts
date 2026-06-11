import { CourseStatus } from '../../../../shared/enums/CourseStatus';

export interface CourseResponseDto {
  id?: string;
  instructorId: string;
  thumbnailUrl: string | null;
  title: string;
  subText: string;
  category: string;
  courseLevel: string;
  language: string;
  price: number;
  features: string[];
  description: string;
  duration: string;
  tags: string[];
  status: CourseStatus | string;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  isEnrolled?: boolean;
  averageRating?: number;
  totalReviews?: number;
  isQuizEnabled?: boolean;
  modules?: unknown[];
  instructor?: unknown;
}

export interface PaginatedCourseResponseDto {
  data: CourseResponseDto[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
