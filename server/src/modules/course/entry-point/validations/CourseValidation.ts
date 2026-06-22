import { z } from 'zod';
import { CourseCategory } from '../../../../shared/enums/CourseCategory';
import { CourseLevel } from '../../../../shared/enums/CourseLevel';
import { CourseDuration } from '../../../../shared/enums/CourseDuration';
import { CourseStatus } from '../../../../shared/enums/CourseStatus';

export const CreateBaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  thumbnail: z.string().nullable().default(null),
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

export const BlockCourseSchema = z.object({
  isBlocked: z.boolean(),
});

export const GetCourseQuerySchema = z.object({
  include: z.string().optional(),
});

export const CreateLessonSchema = z.object({
  moduleId: z.string().min(1, 'Module ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  contentType: z.enum(['video', 'pdf']),
  fileName: z.string().min(1, 'File Name is required'),
  order: z.coerce.number(),
  duration: z.coerce.number().optional().default(0),
  resources: z.array(z.any()).optional(),
  isFreePreview: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export const UpdateLessonSchema = z.record(z.string(), z.any());

export const GetUploadUrlSchema = z.object({
  fileName: z.string().min(1, 'File Name is required'),
  contentType: z.string().optional(),
});

export const GetVideoSignedUrlsSchema = z.object({
  fileNames: z.array(z.string()).min(1, 'At least one file name is required'),
});

export const BlockLessonSchema = z.object({
  isBlocked: z.boolean(),
});

export const CreateModuleSchema = z
  .object({
    courseId: z.string().optional(),
    id: z.string().optional(),
    moduleId: z.string().min(1, 'Module ID is required'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    order: z.number(),
    lessons: z.array(z.any()).optional(),
  })
  .refine((data) => data.courseId || data.id, {
    message: 'Either courseId or id (for course) must be provided',
    path: ['courseId'],
  });

export const UpdateModuleSchema = z.record(z.string(), z.any());
