import { CourseStatus } from '../../../../shared/enums/CourseStatus';

export interface CreateCourseDto {
  instructorId: string;
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
  thumbnailUrl?: string | null;
}

export interface UpdateCourseDto {
  title?: string;
  subText?: string;
  category?: string;
  courseLevel?: string;
  language?: string;
  price?: number;
  features?: string[];
  description?: string;
  duration?: string;
  tags?: string[];
  thumbnailUrl?: string | null;
}

export interface UpdateCourseStatusDto {
  courseId: string;
  instructorId: string;
  status: CourseStatus;
}

export interface BlockCourseDto {
  courseId: string;
  isBlocked: boolean;
}

export interface GetCourseDto {
  courseId: string;
  role: string;
  userId?: string;
  include?: string;
}

export interface GetCoursesQueryDto {
  instructorId?: string;
  status?: string;
  category?: string;
  search?: string;
  level?: string;
  language?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: string;
  isBlocked?: boolean;
}
