import { z } from 'zod';
import { CourseCategory } from '../../../../shared/enums/CourseCategory';
import { CourseLevel } from '../../../../shared/enums/CourseLevel';
import { CourseDuration } from '../../../../shared/enums/CourseDuration';
import { CourseStatus } from '../../../../shared/enums/CourseStatus';

// Validation schemas for CourseController
export const CreateBaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  thumbnail: z.string().nullable(),
  subText: z.string(),
  category: z.nativeEnum(CourseCategory).optional(),
  customCategory: z.string().optional(),
  courseLevel: z.nativeEnum(CourseLevel),
  language: z.string(),
  access: z.nativeEnum(CourseDuration),
  price: z.coerce.number(),
  description: z.string(),
  tags: z.array(z.string()),
  features: z.array(z.string()),
});

export const UpdateBaseSchema = CreateBaseSchema.partial();

export const UpdateStatusSchema = z.object({
  status: z.nativeEnum(CourseStatus),
});

export const CourseIdParamSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
});

export const PaginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 6)),
  sort: z.string().optional(),
  status: z.string().optional(),
  instructorId: z.string().optional(),
  category: z.nativeEnum(CourseCategory).or(z.string()).optional(),
  search: z.string().optional(),
});

export const GetCourseQuerySchema = z.object({
  include: z.string().optional(),
});

// Types
export type CreateBaseValidationType = z.infer<typeof CreateBaseSchema>;
export type UpdateBaseValidationType = z.infer<typeof UpdateBaseSchema>;
export type UpdateStatusValidationType = z.infer<typeof UpdateStatusSchema>;
export type CourseIdParamValidationType = z.infer<typeof CourseIdParamSchema>;
export type PaginationQueryValidationType = z.infer<
  typeof PaginationQuerySchema
>;
export type GetCourseQueryValidationType = z.infer<typeof GetCourseQuerySchema>;

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
  status: string;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  isEnrolled?: boolean;
  averageRating?: number;
  totalReviews?: number;
  isQuizEnabled?: boolean;
}
