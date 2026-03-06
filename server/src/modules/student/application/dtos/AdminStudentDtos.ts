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

import { UserAccountStatus } from '../../../../shared/enums/UserAccountStatus';

export const ChangeStudentStatusSchema = z.object({
  id: z.string().min(1, 'Student ID is required'),
  status: z.enum([UserAccountStatus.ACTIVE, UserAccountStatus.BLOCKED]),
});

export type ChangeStudentStatusDto = z.infer<typeof ChangeStudentStatusSchema>;
