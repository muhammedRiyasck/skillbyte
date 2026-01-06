import { z } from 'zod';

export const InitiatePaymentSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  provider: z.enum(['stripe', 'paypal']),
});

export const CapturePayPalPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
});

export const GetUserPurchasesSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10)),
  status: z.string().optional(),
  dateRange: z.string().optional(),
});

export const GetInstructorEarningsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10)),
});

export type InitiatePaymentDto = z.infer<typeof InitiatePaymentSchema>;
export type CapturePayPalPaymentDto = z.infer<
  typeof CapturePayPalPaymentSchema
>;
export type GetUserPurchasesDto = z.infer<typeof GetUserPurchasesSchema>;
export type GetInstructorEarningsDto = z.infer<
  typeof GetInstructorEarningsSchema
>;
