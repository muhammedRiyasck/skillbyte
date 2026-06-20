import { z } from 'zod';

export const SubmitReportSchema = z.object({
  targetType: z.enum(['review', 'course', 'lesson']),
  targetId: z.string().min(1),
  reason: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
});
