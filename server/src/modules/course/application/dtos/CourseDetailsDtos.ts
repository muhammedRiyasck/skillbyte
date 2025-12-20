import { z } from 'zod';

// Validation schemas for CourseController
export const CreateBaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  thumbnail: z.string().nullable(),
  subText: z.string(),
  category: z.string().optional(),
  customCategory: z.string().optional(),
  courseLevel: z.string(),
  language: z.string(),
  access: z.string(),
  price: z.coerce.number(),
  description: z.string(),
  tags: z.array(z.string()),
  features: z.array(z.string()),
});

export const UpdateBaseSchema = CreateBaseSchema.partial();

export const UpdateStatusSchema = z.object({
  status: z.enum(['list', 'unlist']),
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
  category: z.string().optional(),
  search: z.string().optional(),
  enrolledOnly: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
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
