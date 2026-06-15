import { z } from 'zod';

export const UpdateLessonProgressSchema = z.object({
  lessonId: z.string().min(1, 'Lesson ID is required'),
  lastWatchedSecond: z.number().min(0),
  totalDuration: z.number().min(1, 'totalDuration must be at least 1'),
  isCompleted: z.boolean(),
});

export const InitiatePaymentSchema = z.object({
  id: z.string().min(1, 'Course ID is required'),
  provider: z.enum(['stripe', 'paypal', 'razorpay']),
});
