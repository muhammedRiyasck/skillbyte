import { z } from 'zod';

export const SubmitReviewSchema = z.object({
  targetType: z.enum(['course', 'session']),
  targetId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional().default(''),
});

export const UpdateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
});

export const ReplyToReviewSchema = z.object({
  reply: z.string().max(2000).optional().default(''),
});

export const AdminToggleHideSchema = z.object({
  hide: z.boolean(),
});
