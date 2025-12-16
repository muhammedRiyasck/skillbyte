import { z } from 'zod';

export const AdminStudentPaginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 6)),
  sort: z.string().optional(),
  search: z.string().optional(),
});

export type AdminStudentPaginationDto = z.infer<
  typeof AdminStudentPaginationSchema
>;

export const ChangeStudentStatusSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  status: z.enum(['active', 'blocked']),
});

export type ChangeStudentStatusDto = z.infer<typeof ChangeStudentStatusSchema>;
