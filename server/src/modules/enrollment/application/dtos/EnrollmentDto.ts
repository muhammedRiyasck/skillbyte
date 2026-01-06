import { z } from 'zod';

export const GetStudentEnrollmentsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 6)),
  search: z.string().optional(),
  status: z.enum(['active', 'completed']).optional(),
});

export const UpdateProgressSchema = z.object({
  lessonId: z.string().min(1, 'Lesson ID is required'),
  lastWatchedSecond: z.number().min(0),
  totalDuration: z.number().min(0),
  isCompleted: z.boolean(),
});

export const CheckEnrollmentSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
});

export type GetStudentEnrollmentsDto = z.infer<
  typeof GetStudentEnrollmentsSchema
>;
export type UpdateProgressDto = z.infer<typeof UpdateProgressSchema>;
export type CheckEnrollmentDto = z.infer<typeof CheckEnrollmentSchema>;
