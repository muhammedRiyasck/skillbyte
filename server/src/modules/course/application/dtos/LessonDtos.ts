import { z } from 'zod';

export const CreateLessonSchema = z.object({
  moduleId: z.string().min(1, 'Module ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  contentType: z.enum(['video', 'pdf']),
  fileName: z.string().min(1, 'File Name is required'),
  order: z.coerce.number(),
  duration: z.coerce.number().optional().default(0),
  resources: z.array(z.any()).optional(), // Define stricter if possible
  isFreePreview: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export type CreateLessonDto = z.infer<typeof CreateLessonSchema>;

export const UpdateLessonSchema = z.record(z.string(), z.any()); // Partial updates

export const GetUploadUrlSchema = z.object({
  fileName: z.string().min(1, 'File Name is required'),
  contentType: z.string().optional(), // Controller hardcodes 'video' but maybe useful
});

export const GetVideoSignedUrlsSchema = z.object({
  fileNames: z.array(z.string()).min(1, 'At least one file name is required'),
});

export const BlockLessonSchema = z.object({
  isBlocked: z.boolean(),
});
