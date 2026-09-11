import { CourseStatus } from "@shared/enums/CourseStatus";
import type { ModuleType } from "./IModule";

export interface CourseDetailsResponse {
  data: CourseDetails;
  message: string;
  success: boolean;
}

export interface CourseDetails {
  id: string;
  instructorId: string;
  instructor?: InstructorInfo | undefined;
  thumbnailUrl: string | null;
  title: string;
  subText: string;
  category: string;
  customCategory: string;
  courseLevel: string;
  language: string;
  price: number;
  features: string[];
  description: string;
  duration: string;
  tags: string[];
  status: CourseStatus;
  averageRating?: number | undefined;
  totalReviews?: number | undefined;
  createdAt: string;
  updatedAt: string;
  modules?: ModuleType[] | undefined;
  isQuizEnabled?: boolean | undefined;
}

interface InstructorInfo {
  name: string;
  title: string;
  avatar: string;
  bio: string;
  averageRating?: number;
  totalReviews?: number;
}

export interface LessonProgressItem {
  lessonId: string;
  lastWatchedSecond: number;
  totalDuration?: number;
  isCompleted?: boolean;
}

export interface EnrollmentDetails {
  _id?: string;
  id?: string;
  courseId?: string;
  userId?: string;
  progress?: number;
  isCompleted?: boolean;
  lessonProgress?: LessonProgressItem[];
}

export interface EnrollmentStatusData {
  isEnrolled: boolean;
  enrollment?: EnrollmentDetails;
}

export interface EnrollmentStatusResponse {
  data?: EnrollmentStatusData;
  message?: string;
  success?: boolean;
}
