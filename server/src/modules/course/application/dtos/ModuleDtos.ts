import { z } from 'zod';

export const CreateModuleSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  moduleId: z.string().min(1, 'Module ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  order: z.number(),
  lessons: z.array(z.any()).optional(), // or typed lesson
});

export type CreateModuleDto = z.infer<typeof CreateModuleSchema>;

export const UpdateModuleSchema = z.record(z.string(), z.any());
