import { z } from 'zod';

export const CreateModuleSchema = z
  .object({
    courseId: z.string().optional(),
    id: z.string().optional(), // Frontend might send 'id' for courseId
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

export type CreateModuleDto = z.infer<typeof CreateModuleSchema>;

export const UpdateModuleSchema = z.record(z.string(), z.any());
