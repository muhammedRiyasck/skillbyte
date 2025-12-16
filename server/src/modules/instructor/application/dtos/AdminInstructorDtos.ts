import { z } from 'zod';

export const AdminInstructorPaginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 12)),
  sort: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export type AdminInstructorPaginationDto = z.infer<
  typeof AdminInstructorPaginationSchema
>;

export const ApproveInstructorSchema = z.object({
  instructorId: z.string().min(1, 'Instructor ID is required'),
});

export type ApproveInstructorDto = z.infer<typeof ApproveInstructorSchema>;

export const DeclineInstructorSchema = z.object({
  instructorId: z.string().min(1, 'Instructor ID is required'),
  reason: z.string().min(1, 'Reason is required'),
});

export type DeclineInstructorDto = z.infer<typeof DeclineInstructorSchema>;

export const ChangeInstructorStatusSchema = z.object({
  // instructorId comes from params usually, but could be body. Controller uses params.
  status: z.enum(['active', 'suspend']),
  reason: z.string().optional(),
});

export type ChangeInstructorStatusDto = z.infer<
  typeof ChangeInstructorStatusSchema
>;
