import { z } from 'zod';
import { InstructorAccountStatus } from '../../../../shared/enums/InstructorAccountStatus';

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

export const ApproveInstructorSchema = z.object({
  id: z.string().min(1, 'Instructor ID is required'),
});

export const DeclineInstructorSchema = z.object({
  id: z.string().min(1, 'Instructor ID is required'),
  reason: z.string().min(1, 'Reason is required'),
});

export const ChangeInstructorStatusSchema = z.object({
  status: z.enum([
    InstructorAccountStatus.ACTIVE,
    InstructorAccountStatus.SUSPENDED,
  ]),
  reason: z.string().optional(),
});
